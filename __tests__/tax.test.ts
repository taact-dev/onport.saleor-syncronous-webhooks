import { createMocks } from 'node-mocks-http';
import { fetchData } from '../src/utils/routes';
import handleTaxCalculation from '../src/pages/api/tax';

jest.mock('../src/utils/routes', () => ({
    fetchData: jest.fn(),
}));

const mockFetchRouting = fetchData as jest.MockedFunction<typeof fetchData>;

describe('/api/tax', () => {
    test('returns the calculated tax response', async () => {
        mockFetchRouting.mockImplementation(async () => {
            return [
                {
                    dropshipProvider: {
                        id: '1',
                        name: 'dropship-provider-1',
                        taxCalculation: 'channel',
                    },
                    saleItems: [
                        {
                            externalVariantId: '1',
                        },
                    ],
                },
                {
                    dropshipProvider: {
                        id: '2',
                        name: 'dropship-provider-2',
                        taxCalculation: 'disabled',
                    },
                    saleItems: [
                        {
                            externalVariantId: '2',
                        },
                    ],
                },
            ];
        });
        // fetchRouting.mockResolvedValue([]); // Mock the resolved value
        const mockRequest = createMocks({
            method: 'POST',
            body: [
                {
                    included_taxes_in_prices: true,
                    shipping_amount: 10,
                    address: {
                        type: 'example',
                        id: '1',
                        first_name: 'John',
                        last_name: 'Doe',
                        company_name: 'Example Company',
                        street_address_1: '123 Main St',
                        street_address_2: 'Apt 4',
                        city: 'City',
                        city_area: 'Area',
                        postal_code: '12345',
                        country: 'USA',
                        country_area: 'State',
                        phone: '123-456-7890',
                    },
                    lines: [
                        {
                            id: '1',
                            charge_taxes: true,
                            sku: 'SKU001',
                            variant_id: '1',
                            unit_amount: '10',
                            quantity: 2,
                            total_amount: '20',
                        },
                        {
                            id: '2',
                            charge_taxes: false,
                            sku: 'SKU002',
                            variant_id: '2',
                            unit_amount: '15',
                            quantity: 1,
                            total_amount: '15',
                        },
                    ],
                },
            ],
        });
        const mockResponse = createMocks();
        await handleTaxCalculation(mockRequest.req, mockResponse.res);
        expect(mockResponse.res.statusCode).toBe(200);
        const responseData = JSON.parse(mockResponse.res._getData());
        console.log('Reviewing response data', responseData);
        expect(responseData).toEqual({
            shipping_tax_rate: 20,
            shipping_price_gross_amount: 10,
            // Should reverse in the VAT to 8.33 + 1.67
            shipping_price_net_amount: 8.33,
            lines: [
                {
                    // This vendor has a tax rate  set in Onport, so we should apply tax and reverse it in
                    tax_rate: 20,
                    total_gross_amount: 20,
                    total_net_amount: 16.67,
                },
                {
                    tax_rate: 0,
                    total_gross_amount: 15,
                    total_net_amount: 15,
                },
            ],
        });
    });
});
