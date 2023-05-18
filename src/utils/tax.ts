// Function: round
// Description: Rounds the given number to two decimal places.
// Parameters:
// - value: The number to be rounded.
// Returns: The rounded number.
export function round(value: number): number {
    // Multiply the value by 100 and round it to the nearest integer.
    // Then, divide the result by 100 to obtain two decimal places.
    return Math.round(value * 100) / 100;
}

export function calculateNet(
    grossPrice: number,
    taxRate: number,
    reverse: boolean,
): number {
    if (reverse) {
        return round(grossPrice / (1 + taxRate / 100));
    }
    return grossPrice;
}

export function calculateGross(
    grossPrice: number,
    taxRate: number,
    reverse: boolean,
): number {
    if (reverse) {
        return grossPrice;
    }
    return round(grossPrice * (1 + taxRate / 100));
}
