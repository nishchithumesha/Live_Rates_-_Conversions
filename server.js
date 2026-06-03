const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware to serve static files
app.use(express.static('public'));

// API Endpoint: Conversion
app.get('/api/convert', async (req, res) => {
  const { from, to, amount } = req.query;

  console.log(`Received conversion request: ${amount} from ${from} to ${to}`);

  if (!from || !to || !amount) {
    return res.status(400).json({ error: "Missing 'from', 'to', or 'amount' parameters." });
  }

  try {
    let convertedAmount;

    // Cryptocurrency to Cryptocurrency (e.g., NEO to BCC)
    if (await isCrypto(from) && await isCrypto(to)) {
      console.log(`Fetching prices for ${from} and ${to}`);
      
      // Fetch the price of the 'from' cryptocurrency in USDT
      const fromPrice = await getCryptoPrice(from); 
      // Fetch the price of the 'to' cryptocurrency in USDT
      const toPrice = await getCryptoPrice(to);

      if (!fromPrice || !toPrice) {
        return res.status(400).json({ error: `Invalid or unsupported cryptocurrency: ${from} or ${to}` });
      }

      console.log(`Prices: ${from} = ${fromPrice} USDT, ${to} = ${toPrice} USDT`);
      // Calculate the exchange rate between the two cryptocurrencies
      const exchangeRate = fromPrice / toPrice; 
      convertedAmount = amount * exchangeRate;
    }
    // Cryptocurrency to Fiat (e.g., BTC to USD)
    else if (await isCrypto(from)) {
      console.log(`Fetching price for crypto: ${from} to USD`);
      const cryptoPrice = await getCryptoPrice(from);

      if (!cryptoPrice) {
        return res.status(400).json({ error: `Invalid or unsupported cryptocurrency: ${from}` });
      }

      if (to === 'USD') {
        convertedAmount = amount * cryptoPrice;
      } else {
        console.log(`Fetching fiat rate for USD to ${to}`);
        const fiatRate = await getFiatRate('USD', to);
        if (!fiatRate) {
          return res.status(400).json({ error: `Invalid fiat currency: ${to}` });
        }
        convertedAmount = amount * cryptoPrice * fiatRate;
      }
    }
    // Fiat to Cryptocurrency (e.g., USD to BTC)
    else if (await isCrypto(to)) {
      console.log(`Fetching fiat rate for ${from} to USD`);
      const fiatRate = await getFiatRate(from, 'USD');
      if (!fiatRate) {
        return res.status(400).json({ error: `Invalid fiat currency: ${from}` });
      }

      console.log(`Fetching price for crypto: ${to}`);
      const cryptoPrice = await getCryptoPrice(to);
      if (!cryptoPrice) {
        return res.status(400).json({ error: `Invalid or unsupported cryptocurrency: ${to}` });
      }

      convertedAmount = (amount * fiatRate) / cryptoPrice;
    }
    // Fiat to Fiat Conversion (e.g., USD to EUR)
    else {
      console.log(`Fetching fiat rate for ${from} to ${to}`);
      const fiatRate = await getFiatRate(from, to);
      if (!fiatRate) {
        return res.status(400).json({ error: `Invalid fiat currency: ${to}` });
      }
      convertedAmount = amount * fiatRate;
    }

    res.json({ convertedAmount: convertedAmount.toFixed(8) });
  } catch (error) {
    console.error('Error during conversion:', error.message);
    res.status(500).json({ error: 'Error fetching currency data.' });
  }
});

// Utility: Check if a symbol is a cryptocurrency
async function isCrypto(symbol) {
  try {
    const response = await axios.get(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol}USDT`);
    return response.data && response.data.price;
  } catch {
    return false;
  }
}

// Utility: Get price of a cryptocurrency in USDT
async function getCryptoPrice(symbol) {
  try {
    const response = await axios.get(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol}USDT`);
    return parseFloat(response.data.price);
  } catch {
    return null;
  }
}

// Utility: Get exchange rate for fiat currencies
async function getFiatRate(from, to) {
  try {
    const response = await axios.get(`https://v6.exchangerate-api.com/v6/${process.env.API_KEY}/latest/${from}`);
    return response.data.conversion_rates[to];
  } catch {
    return null;
  }
}

// API Endpoint: Get Cryptocurrencies
app.get('/api/get-cryptos', async (req, res) => {
  try {
    console.log('Fetching cryptocurrencies from Binance...');
    const response = await axios.get('https://api.binance.com/api/v3/ticker/price');
    const cryptoData = response.data
      .filter(item => item.symbol.endsWith('USDT'))
      .map(item => ({
        symbol: item.symbol.replace('USDT', ''),
        price: item.price,
      }));
    console.log('Fetched cryptocurrencies:', cryptoData);
    res.json(cryptoData);
  } catch (error) {
    console.error('Error fetching cryptocurrencies:', error.message);
    res.status(500).json({ error: 'Failed to fetch cryptocurrencies.' });
  }
});

// Serve the frontend
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
