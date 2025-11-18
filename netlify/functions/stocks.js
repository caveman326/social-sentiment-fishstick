const axios = require('axios');

// Cache for API data
let cachedData = null;
let lastFetch = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

exports.handler = async function(event, context) {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle OPTIONS request for CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    const now = Date.now();

    // Return cached data if still fresh
    if (cachedData && (now - lastFetch) < CACHE_DURATION) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(cachedData)
      };
    }

    // Fetch fresh data from Apewisdom API
    const response = await axios.get('https://apewisdom.io/api/v1.0/filter/all-stocks');

    if (response.data && response.data.results) {
      cachedData = response.data;
      lastFetch = now;

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(cachedData)
      };
    } else {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Invalid API response' })
      };
    }
  } catch (error) {
    console.error('Error fetching data:', error.message);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to fetch stock data', message: error.message })
    };
  }
};
