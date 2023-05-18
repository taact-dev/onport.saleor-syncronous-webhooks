# Next.js Tax Webhook Endpoint

This Next.js project implements a single endpoint, `/tax`, which accepts a payload according to the documentation provided at [https://docs.saleor.io/docs/3.x/developer/extending/apps/synchronous-webhooks/tax-webhooks](https://docs.saleor.io/docs/3.x/developer/extending/apps/synchronous-webhooks/tax-webhooks). It then processes the payload and returns the required response.

## Prerequisites

Before running the project, make sure you have the following:

-   Node.js installed (version X.X.X or higher)
-   Yarn package manager installed (version X.X.X or higher)
-   An Onport account with a channel ID and API token

## Installation

1. Clone this repository to your local machine:

    ```bash
    git clone https://github.com/your-username/nextjs-tax-webhook.git
    ```

2. Navigate to the project directory:

    ```bash
    cd nextjs-tax-webhook
    ```

3. Install project dependencies using Yarn:

    ```bash
    yarn install
    ```

## Configuration

1. Create a `.env` file in the project's root directory.

2. Open the `.env` file and add the following variables:

    ```plaintext
    CHANNEL_ID=your-onport-channel-id
    TOKEN=your-onport-api-token
    ```

    Replace `your-onport-channel-id` and `your-onport-api-token` with your actual Onport channel ID and API token.

## Running the Project

To start the Next.js server and run the project, use the following command:

```bash
yarn dev
```

The server will start on `http://localhost:3000`.

## Testing

To run the tests, use the following command:

```bash
yarn test
```

## Usage

To use the `/tax` endpoint, send a POST request to `http://localhost:3000/tax` with the payload specified in the [documentation](https://docs.saleor.io/docs/3.x/developer/extending/apps/synchronous-webhooks/tax-webhooks).

The endpoint will process the payload and make a call to the Onport API to determine the line item that should be taxed. It will then return the required response.

Remember to update the base URL (`http://localhost:3000`) if you deploy the project to a different environment.

## License

This project is licensed under the [MIT License](LICENSE).
