const express = require('express');
const router = express.Router();
const axios = require('axios');

// Function to get real forex rates from API
const getRealRates = async () => {
  try {
    // Using Open Exchange Rates API (free tier)
    const apiKey = process.env.OPEN_EXCHANGE_RATES_KEY;
    
    if (!apiKey) {
      // Mock data if API key not available
      return {
        'USD/EUR': 0.92,
        'USD/GBP': 0.79,
        'USD/JPY': 149.50,
        'EUR/GBP': 0.86,
        'EUR/USD': 1.09,
        'GBP/USD': 1.27,
        'JPY/USD': 0.0067,
        'CAD/USD': 0.735,
        'AUD/USD': 0.658,
        'CHF/USD': 1.136
      };
    }

    const response = await axios.get(`https://openexchangerates.org/api/latest.json`, {
      params: {
        app_id: apiKey,
        base: 'USD',
        symbols: 'EUR,GBP,JPY,CAD,AUD,CHF,INR'
      }
    });

    const rates = response.data.rates;
    return {
      'USD/EUR': rates.EUR,
      'USD/GBP': rates.GBP,
      'USD/JPY': rates.JPY,
      'USD/CAD': rates.CAD,
      'USD/AUD': rates.AUD,
      'USD/CHF': rates.CHF,
      'USD/INR': rates.INR,
      'EUR/USD': 1 / rates.EUR,
      'GBP/USD': 1 / rates.GBP
    };
  } catch (err) {
    console.log('Error fetching rates:', err.message);
    // Return mock data on error
    return {
      'USD/EUR': 0.92,
      'USD/GBP': 0.79,
      'USD/JPY': 149.50,
      'EUR/GBP': 0.86,
      'EUR/USD': 1.09,
      'GBP/USD': 1.27,
      'JPY/USD': 0.0067,
      'CAD/USD': 0.735,
      'AUD/USD': 0.658,
      'CHF/USD': 1.136
    };
  }
};

// Get all major currency pairs rates
router.get('/all', async (req, res) => {
  try {
    const rates = await getRealRates();
    res.json({ success: true, rates, timestamp: new Date() });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get specific currency pair
router.get('/:pair', async (req, res) => {
  try {
    const { pair } = req.params;
    const rates = await getRealRates();
    
    if (!rates[pair]) {
      return res.status(404).json({ success: false, message: 'Currency pair not found' });
    }

    res.json({ 
      success: true, 
      pair,
      rate: rates[pair],
      timestamp: new Date()
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Convert currency
router.post('/convert', async (req, res) => {
  try {
    const { from, to, amount } = req.body;
    
    if (!from || !to || !amount) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const rates = await getRealRates();
    const pair = `${from}/${to}`;

    if (!rates[pair]) {
      return res.status(404).json({ success: false, message: 'Currency pair not found' });
    }

    const convertedAmount = amount * rates[pair];

    res.json({ 
      success: true, 
      from,
      to,
      amount,
      rate: rates[pair],
      convertedAmount,
      timestamp: new Date()
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
