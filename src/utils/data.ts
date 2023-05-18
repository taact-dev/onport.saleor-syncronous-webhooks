export async function fetchData(uri: string, json: any): Promise<any> {
    const response = await fetch(uri, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${process.env.TOKEN}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(json),
    });

    const { shipments } = await response.json();
    return shipments;
}
