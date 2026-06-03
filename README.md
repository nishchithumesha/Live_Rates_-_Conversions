# Live Rates - Conversions

Simple Node.js + Express app that serves a frontend and provides currency/cryptocurrency conversion endpoints using Binance and ExchangeRate-API.

## Features
- Convert between fiat currencies and cryptocurrencies
- Fetch list of cryptocurrencies (Binance USDT pairs)
- Minimal static frontend served from `public/`

## Prerequisites
- Node.js 14+ and npm
- An API key for ExchangeRate-API (or compatible service) stored in `.env` as `API_KEY`.

## Setup
1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file in the project root with at least:

```env
API_KEY=your_exchangerate_api_key_here
PORT=4000
```

3. Start the app:

```bash
npm start
```

The app will serve the frontend at `http://localhost:4000/` by default.

## API Endpoints
- `GET /api/convert?from=USD&to=EUR&amount=1` — Convert `amount` from `from` currency to `to` currency. Supports fiat and crypto symbols.
- `GET /api/get-cryptos` — Returns available Binance symbols paired with USDT and their prices.

## Notes
- Cryptocurrency price lookups use Binance ticker endpoints (symbol + `USDT`). Use common symbols (e.g., `BTC`, `ETH`).
- Exchange rates use ExchangeRate-API; ensure your `API_KEY` has access and is valid.
- Do not commit secrets. `.env` is listed in `.gitignore` (if present) — keep API keys private.

## License
This project has no license specified.

---
Updated README with setup and usage instructions.
