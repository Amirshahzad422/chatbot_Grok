const http = require('http');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env file or config.js
try {
  const envFile = fs.readFileSync('.env', 'utf8');
  envFile.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value && !key.startsWith('#')) {
      process.env[key.trim()] = value.trim();
    }
  });
} catch (err) {
  console.log('No .env file found, checking for config.js...');
  try {
    const config = require('./config.js');
    Object.assign(process.env, config);
    console.log('Loaded configuration from config.js');
  } catch (configErr) {
    console.log('No config.js found, using system environment variables');
  }
}

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

function sendJson(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

const server = http.createServer(async (req, res) => {
  console.log(`${req.method} ${req.url}`);

  // Test endpoint for API key validation
  if (req.method === 'GET' && req.url === '/api/test-key') {
    try {
      const hasOpenAIKey = process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.startsWith('sk-');
      
      if (!hasOpenAIKey) {
        sendJson(res, 400, { error: 'No OpenAI API key configured' });
        return;
      }

      // Test the API key
      const testRes = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        }
      });

      const testData = await testRes.text();
      
      sendJson(res, testRes.status, {
        status: testRes.status,
        keyType: process.env.OPENAI_API_KEY.startsWith('sk-svcacct-') ? 'Service Account' : 'Regular',
        keyValid: testRes.ok,
        response: testRes.ok ? 'API key is valid!' : testData.substring(0, 500)
      });
    } catch (error) {
      sendJson(res, 500, { error: 'Test failed', detail: error.message });
    }
    return;
  }

  // API proxy for both Groq and OpenAI
  if (req.method === 'POST' && req.url === '/api/chat') {
    try {
      // Check if we have either API key
      const hasGroqKey = process.env.GROQ_API_KEY && 
                        process.env.GROQ_API_KEY !== 'gsk_your_actual_api_key_here' &&
                        process.env.GROQ_API_KEY !== 'your_actual_groq_api_key_here' &&
                        process.env.GROQ_API_KEY.startsWith('gsk_');
      
      const hasOpenAIKey = process.env.OPENAI_API_KEY && 
                          process.env.OPENAI_API_KEY.startsWith('sk-');
      
      if (!hasGroqKey && !hasOpenAIKey) {
        sendJson(res, 500, { 
          error: 'No API key configured. Please set either GROQ_API_KEY or OPENAI_API_KEY.',
          instructions: 'Get your API key from https://console.groq.com/keys (for Groq) or https://platform.openai.com/api-keys (for OpenAI)',
          available_keys: {
            groq: hasGroqKey ? 'Valid' : 'Not set or invalid',
            openai: hasOpenAIKey ? 'Valid' : 'Not set or invalid'
          }
        });
        return;
      }

      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', async () => {
        try {
          const parsed = body ? JSON.parse(body) : {};
          const { messages, model = 'deepseek-r1-distill-llama-70b', temperature = 0.7, max_tokens = 800, provider = 'auto' } = parsed;

          if (!Array.isArray(messages)) {
            sendJson(res, 400, { error: 'Invalid request: messages must be an array' });
            return;
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
            sendJson(res, 500, { error: 'No valid API key available for the requested provider' });
            return;
          }

          const apiRes = await fetch(apiUrl, {
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

          const apiText = await apiRes.text();
          console.log(`API Response Status: ${apiRes.status}`);
          
          // Try to forward JSON body; if not JSON, wrap it
          try {
            const apiJson = JSON.parse(apiText);
            
            // If there's an API error, log it for debugging
            if (!apiRes.ok) {
              console.log('API Error:', apiJson);
              
              // Provide helpful error messages
              if (apiJson.error?.message?.includes('Incorrect API key')) {
                apiJson.error.message += '\n\nTroubleshooting:\n- Verify your API key is correct\n- Check if it\'s a service account key (starts with sk-svcacct-)\n- Ensure the key has proper permissions\n- Try generating a new API key';
              }
            }
            
            res.writeHead(apiRes.status, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(apiJson));
          } catch {
            sendJson(res, apiRes.status, { raw: apiText });
          }
        } catch (e) {
          sendJson(res, 400, { error: 'Invalid JSON body', detail: String(e.message || e) });
        }
      });
    } catch (e) {
      sendJson(res, 500, { error: 'Proxy error', detail: String(e.message || e) });
    }
    return;
  }
  
  // Handle the root path and static files
  let filePath = req.url === '/'
    ? './public/index.html'
    : './public' + req.url;
  
  const extname = path.extname(filePath);
  let contentType = MIME_TYPES[extname] || 'application/octet-stream';
  
  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // File not found
        fs.readFile('./public/404.html', (err, content) => {
          res.writeHead(404, { 'Content-Type': 'text/html' });
          res.end(content || 'File not found', 'utf-8');
        });
      } else {
        // Server error
        res.writeHead(500);
        res.end(`Server Error: ${err.code}`);
      }
    } else {
      // Success
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

// Start server with better error handling
server.listen(PORT, (err) => {
  if (err) {
    if (err.code === 'EADDRINUSE') {
      console.log(`❌ Port ${PORT} is already in use!`);
      console.log(`💡 Try running: lsof -ti:${PORT} | xargs kill`);
      console.log(`🔄 Or use a different port with: PORT=3002 node server.js`);
      process.exit(1);
    } else {
      console.log(`❌ Error starting server: ${err.message}`);
      process.exit(1);
    }
  } else {
    console.log(`🚀 AI Chatbot Server running at http://localhost:${PORT}/`);
    console.log(`📝 Supported APIs: OpenAI and Groq`);
    
    const hasGroqKey = process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.startsWith('gsk_');
    const hasOpenAIKey = process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.startsWith('sk-');
    
    if (hasOpenAIKey) {
      const keyType = process.env.OPENAI_API_KEY.startsWith('sk-svcacct-') ? 'Service Account' : 'Regular';
      console.log(`✅ OpenAI API key configured (${keyType} key)`);
      if (keyType === 'Service Account') {
        console.log(`⚠️  Note: Service account keys may have different permissions`);
      }
    } else {
      console.log(`❌ OpenAI API key not set (get from: https://platform.openai.com/api-keys)`);
    }
    
    if (hasGroqKey) {
      console.log(`✅ Groq API key configured`);
    } else {
      console.log(`❌ Groq API key not set (get from: https://console.groq.com/keys)`);
    }
    
    if (!hasOpenAIKey && !hasGroqKey) {
      console.log(`⚠️  No API keys configured! Add them to config.js or environment variables.`);
    }
    
    console.log(`Press Ctrl+C to stop the server`);
  }
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server gracefully...');
  server.close(() => {
    console.log('✅ Server closed successfully');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down server gracefully...');
  server.close(() => {
    console.log('✅ Server closed successfully');
    process.exit(0);
  });
});
