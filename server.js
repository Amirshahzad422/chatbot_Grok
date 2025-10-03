const http = require('http');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env file
try {
  const envFile = fs.readFileSync('.env', 'utf8');
  envFile.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value && !key.startsWith('#')) {
      process.env[key.trim()] = value.trim();
    }
  });
} catch (err) {
  console.log('No .env file found, using system environment variables');
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

  // API proxy for OpenAI-compatible endpoint
  if (req.method === 'POST' && req.url === '/api/chat') {
    try {
      const openaiKey = process.env.OPENAI_API_KEY;
      if (!openaiKey) {
        sendJson(res, 500, { error: 'API key not configured. Please set OPENAI_API_KEY in .env or environment variables.' });
        return;
      }

      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', async () => {
        try {
          const parsed = body ? JSON.parse(body) : {};
          const { messages, model = 'gpt-4o-mini', temperature = 0.7, max_tokens = 800 } = parsed;

          if (!Array.isArray(messages)) {
            sendJson(res, 400, { error: 'Invalid request: messages must be an array' });
            return;
          }

          const aiRes = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${openaiKey}`
            },
            body: JSON.stringify({
              model,
              messages,
              temperature,
              max_tokens
            })
          });

          const groqText = await aiRes.text();
          // Try to forward JSON body; if not JSON, wrap it
          try {
            const groqJson = JSON.parse(groqText);
            res.writeHead(aiRes.status, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(groqJson));
          } catch {
            sendJson(res, aiRes.status, { raw: groqText });
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
    ? './index.html'
    : '.' + req.url;
  
  const extname = path.extname(filePath);
  let contentType = MIME_TYPES[extname] || 'application/octet-stream';
  
  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // File not found
        fs.readFile('./404.html', (err, content) => {
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
    console.log(`🚀 Chatbot Server running at http://localhost:${PORT}/`);
    console.log(`📝 To enable AI features, set your OPENAI_API_KEY in the .env file`);
    console.log(`🔑 Docs: https://platform.openai.com/`);
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
