import type { NextApiRequest, NextApiResponse } from 'next';

import { fetchData } from '../../utils/routes';
import { pick } from 'lodash';

//  Payload in from Saleor
type SaleorPayload = {
    included_taxes_in_prices: boolean;
    shipping_amount: number;
    address: {
        type: string;
        id: string;
        first_name: string;
        last_name: string;
        company_name: string;
        street_address_1: string;
        street_address_2: string;
        city: string;
        city_area: string;
        postal_code: string;
        country: string;
        country_area: string;
        phone: string;
    };
    lines: Array<{
        id: string;
        charge_taxes: boolean;
        sku: string;
        variant_id: string;
        unit_amount: string;
        quantity: number;
        total_amount: string;
    }>;
};

// Payload back to Saleor
type SaleorResponse = {
    shipping_tax_rate: number;
    shipping_price_gross_amount: number;
    shipping_price_net_amount: number;
    lines: Array<{
        tax_rate: number;
        total_gross_amount: number;
        total_net_amount: number;
    }>;
};

type DropshipProvider = {
    id: string;
    taxCalculation: 'disabled' | 'taxjar' | 'channel' | 'manual';
};

// Data back from Onport
type Shipment = {
    dropshipProvider: DropshipProvider;
    saleItems: Array<{
        externalVariantId: string;
    }>;
};

type Flat = Array<{
    externalVariantId: string;
    dropshipProvider: DropshipProvider;
}>;

function calculateNet(
    grossPrice: number,
    taxRate: number,
    reverse: boolean,
): number {
    if (reverse) {
        // 0.47619047619047616
        return parseFloat((grossPrice / (1 + taxRate / 100)).toFixed(2));
    }
    return grossPrice;
}

function calculateGross(
    grossPrice: number,
    taxRate: number,
    reverse: boolean,
): number {
    if (reverse) {
        return grossPrice;
    }
    return parseFloat((grossPrice * (1 + taxRate / 100)).toFixed(2));
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    const {
        address,
        lines,
        shipping_amount,
        included_taxes_in_prices,
    }: SaleorPayload = req.body[0];
    const json = {
        rate: {
            destination: {
                country: address.country,
                postal_code: address.postal_code,
                province: address.country_area,
                city: address.city,
                address1: address.street_address_1,
                address2: address.street_address_2,
                phone: address.phone,
                company_name: address.company_name,
                first_name: address.first_name,
                last_name: address.last_name,
            },
            items: lines.map((line: any) => ({
                ...pick(line, 'id', 'variant_id', 'quantity'),
            })),
            currency: 'USD',
        },
        options: {
            scope: 'sku',
        },
    };
    const uri = `https://api.onport.com/api/channels/${process.env.CHANNEL_ID}/route-shipments.json`;
    console.log(`Sending request to ${uri}`);
    const shipments: Shipment[] = await fetchData(uri, json);
    const flat: Flat = shipments.reduce(
        (acc: any, { saleItems, dropshipProvider }: Shipment) => {
            return [
                ...acc,
                ...saleItems.map(({ externalVariantId }) => ({
                    externalVariantId,
                    dropshipProvider,
                })),
            ];
        },
        [] as any,
    );
    // Overall tax rate for the order
    const taxRate = 20;
    const taxResponse: SaleorResponse = {
        shipping_tax_rate: taxRate,
        // The gross amount is consistent when taxes are included in the prices
        shipping_price_gross_amount: calculateGross(
            shipping_amount,
            taxRate,
            included_taxes_in_prices,
        ),
        // Reverse in the tax price if there is any tax to apply
        shipping_price_net_amount: calculateNet(
            shipping_amount,
            taxRate,
            included_taxes_in_prices,
        ),
        // The line items need to be returned in the same order
        lines: lines.map((line: any) => {
            // Find the dropship provider for the line item
            const dropshipProvider = flat.find(
                ({ externalVariantId }) =>
                    externalVariantId === line.variant_id,
            )?.dropshipProvider;
            // Check the dropship provider tax settings. The assumption being is taxCalculation is set to 'disabled'
            // then the line item is not taxable. If it is set anything else then the line item is taxable.
            //     taxCalculation: {
            //     type: ENUM,
            //     values: ['disabled', 'taxjar', 'channel', 'manual'],
            // },
            const lineTaxable = dropshipProvider?.taxCalculation !== 'disabled';
            // Will also treat the line item as taxable is no dropship provider is found
            const applyTax = lineTaxable || !dropshipProvider;
            console.log(
                `Found matching dropship provider for line item ${line.variant_id}`,
                { dropshipProvider, applyTax },
            );
            if (applyTax) {
                if (included_taxes_in_prices) {
                    // Need to tax and reverse in the prices
                    return {
                        tax_rate: taxRate,
                        total_gross_amount: calculateGross(
                            parseFloat(line.total_amount),
                            taxRate,
                            included_taxes_in_prices,
                        ),
                        total_net_amount: calculateNet(
                            parseFloat(line.total_amount),
                            taxRate,
                            included_taxes_in_prices,
                        ),
                    };
                } else {
                    // Need to tax, but uplift and not reverse the prices
                    return {
                        tax_rate: taxRate,
                        // Teh gross amount has to be uplifted
                        total_gross_amount: calculateGross(
                            parseFloat(line.total_amount),
                            taxRate,
                            included_taxes_in_prices,
                        ),
                        // The net amount is consistent when taxes are not included in the prices
                        total_net_amount: parseFloat(line.total_amount),
                    };
                }
            }
            // No tax to apply
            return {
                tax_rate: 0,
                total_gross_amount: parseFloat(line.total_amount),
                total_net_amount: parseFloat(line.total_amount),
            };
        }),
    };
    res.status(200).json(taxResponse);
}
