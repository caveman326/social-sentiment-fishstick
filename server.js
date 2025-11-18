const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static('public'));

// Cache for API data
let cachedData = null;
let lastFetch = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// API endpoint to get stock data
app.get('/api/stocks', async (req, res) => {
  try {
    const now = Date.now();
    
    // Return cached data if still fresh
    if (cachedData && (now - lastFetch) < CACHE_DURATION) {
      return res.json(cachedData);
    }

    // Fetch fresh data from Apewisdom API
    const response = await axios.get('https://apewisdom.io/api/v1.0/filter/all-stocks');
    
    if (response.data && response.data.results) {
      cachedData = response.data;
      lastFetch = now;
      res.json(cachedData);
    } else {
      res.status(500).json({ error: 'Invalid API response' });
    }
  } catch (error) {
    console.error('Error fetching data:', error.message);
    res.status(500).json({ error: 'Failed to fetch stock data' });
  }
});

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

