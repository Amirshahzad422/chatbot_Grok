// Netlify Function for API Key Testing
exports.handler = async (event, context) => {
  // Handle CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const hasOpenAIKey = process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.startsWith('sk-');
    
    if (!hasOpenAIKey) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'No OpenAI API key configured' })
      };
    }

    // Test the API key
    const testRes = await fetch('https://api.openai.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      }
    });

    const testData = await testRes.text();
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        status: testRes.status,
        keyType: process.env.OPENAI_API_KEY.startsWith('sk-svcacct-') ? 'Service Account' : 'Regular',
        keyValid: testRes.ok,
        response: testRes.ok ? 'API key is valid!' : testData.substring(0, 500)
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Test failed', detail: error.message })
    };
  }
};
