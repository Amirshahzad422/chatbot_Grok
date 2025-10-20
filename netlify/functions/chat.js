// Netlify Function for AI Chat API
exports.handler = async (event, context) => {
  // Handle CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
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

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Check if we have API keys
    const hasGroqKey = process.env.GROQ_API_KEY && 
                      process.env.GROQ_API_KEY !== 'gsk_your_actual_api_key_here' &&
                      process.env.GROQ_API_KEY !== 'your_actual_groq_api_key_here' &&
                      process.env.GROQ_API_KEY.startsWith('gsk_');
    
    const hasOpenAIKey = process.env.OPENAI_API_KEY && 
                        process.env.OPENAI_API_KEY.startsWith('sk-');
    
    if (!hasGroqKey && !hasOpenAIKey) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'No API key configured. Please set either GROQ_API_KEY or OPENAI_API_KEY.',
          instructions: 'Get your API key from https://console.groq.com/keys (for Groq) or https://platform.openai.com/api-keys (for OpenAI)',
          available_keys: {
            groq: hasGroqKey ? 'Valid' : 'Not set or invalid',
            openai: hasOpenAIKey ? 'Valid' : 'Not set or invalid'
          }
        })
      };
    }

    // Parse request body
    const body = JSON.parse(event.body || '{}');
    const { messages, model = 'deepseek-r1-distill-llama-70b', temperature = 0.7, max_tokens = 800, provider = 'auto' } = body;

    if (!Array.isArray(messages)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid request: messages must be an array' })
      };
    }

    // Determine which API to use
    let useOpenAI = false;
    if (provider === 'openai' || (provider === 'auto' && hasOpenAIKey && !hasGroqKey)) {
      useOpenAI = true;
    } else if (provider === 'groq' || (provider === 'auto' && hasGroqKey)) {
      useOpenAI = false;
    } else if (model.includes('gpt-') || model.includes('o1-')) {
      useOpenAI = true;
    }

    let apiUrl, apiKey, requestModel;
    if (useOpenAI && hasOpenAIKey) {
      apiUrl = 'https://api.openai.com/v1/chat/completions';
      apiKey = process.env.OPENAI_API_KEY;
      requestModel = model.includes('gpt-') || model.includes('o1-') ? model : 'gpt-3.5-turbo';
    } else if (hasGroqKey) {
      apiUrl = 'https://api.groq.com/openai/v1/chat/completions';
      apiKey = process.env.GROQ_API_KEY;
      requestModel = model;
    } else {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'No valid API key available for the requested provider' })
      };
    }

    // Make API request
    const apiResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: requestModel,
        messages,
        temperature,
        max_tokens
      })
    });

    const apiText = await apiResponse.text();
    console.log(`API Response Status: ${apiResponse.status}`);
    
    // Try to parse JSON response
    try {
      const apiJson = JSON.parse(apiText);
      
      // If there's an API error, log it for debugging
      if (!apiResponse.ok) {
        console.log('API Error:', apiJson);
        
        // Provide helpful error messages
        if (apiJson.error?.message?.includes('Incorrect API key')) {
          apiJson.error.message += '\n\nTroubleshooting:\n- Verify your API key is correct\n- Check if it\'s a service account key (starts with sk-svcacct-)\n- Ensure the key has proper permissions\n- Try generating a new API key';
        }
      }
      
      return {
        statusCode: apiResponse.status,
        headers,
        body: JSON.stringify(apiJson)
      };
    } catch {
      return {
        statusCode: apiResponse.status,
        headers,
        body: JSON.stringify({ raw: apiText })
      };
    }

  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error', 
        detail: error.message 
      })
    };
  }
};
