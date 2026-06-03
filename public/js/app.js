document.addEventListener('DOMContentLoaded', async () => {
  const fromCurrencyDropdown = document.getElementById('from-currency-dropdown');
  const toCurrencyDropdown = document.getElementById('to-currency-dropdown');
  const resultElement = document.getElementById('result');

  try {
    console.log('Fetching cryptocurrencies...');
    const response = await fetch('/api/get-cryptos');
    const cryptoData = await response.json();

    cryptoData.forEach(crypto => {
      const option = document.createElement('option');
      option.value = crypto.symbol;
      option.textContent = `${crypto.symbol} (${parseFloat(crypto.price).toFixed(2)} USD)`;

      fromCurrencyDropdown.appendChild(option.cloneNode(true));
      toCurrencyDropdown.appendChild(option.cloneNode(true));
    });

    console.log('Dropdowns populated successfully');
  } catch (error) {
    console.error('Error fetching cryptocurrencies:', error);
    resultElement.textContent = 'Error loading cryptocurrencies.';
  }
});

// Handle form submission
document.getElementById('converter-form').addEventListener('submit', async (event) => {
  event.preventDefault();

  const amount = document.getElementById('amount').value;
  const fromInput = document.getElementById('from-currency-input').value.toUpperCase();
  const fromDropdown = document.getElementById('from-currency-dropdown').value;
  const toInput = document.getElementById('to-currency-input').value.toUpperCase();
  const toDropdown = document.getElementById('to-currency-dropdown').value;

  const from = fromInput || fromDropdown;
  const to = toInput || toDropdown;

  const resultElement = document.getElementById('result');

  if (!amount || !from || !to) {
    resultElement.textContent = 'Please provide valid input values.';
    return;
  }

  try {
    console.log(`Converting ${amount} from ${from} to ${to}`);
    const response = await fetch(`/api/convert?from=${from}&to=${to}&amount=${amount}`);
    const data = await response.json();

    if (data.error) {
      resultElement.textContent = `Error: ${data.error}`;
    } else {
      resultElement.textContent = `Converted Amount: ${data.convertedAmount} ${to}`;
    }
  } catch (error) {
    console.error('Error during conversion:', error);
    resultElement.textContent = 'An error occurred during conversion.';
  }
});
