const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

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

  // API proxy for Groq
  if (req.method === 'POST' && req.url === '/api/chat') {
    try {
      if (!process.env.GROQ_API_KEY) {
        sendJson(res, 500, { error: 'Server misconfiguration: GROQ_API_KEY not set' });
        return;
      }

      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', async () => {
        try {
          const parsed = body ? JSON.parse(body) : {};
          const { messages, model = 'deepseek-r1-distill-llama-70b', temperature = 0.7, max_tokens = 800 } = parsed;

          if (!Array.isArray(messages)) {
            sendJson(res, 400, { error: 'Invalid request: messages must be an array' });
            return;
          }

          const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
            },
            body: JSON.stringify({
              model,
              messages,
              temperature,
              max_tokens
            })
          });

          const groqText = await groqRes.text();
          // Try to forward JSON body; if not JSON, wrap it
          try {
            const groqJson = JSON.parse(groqText);
            res.writeHead(groqRes.status, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(groqJson));
          } catch {
            sendJson(res, groqRes.status, { raw: groqText });
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

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
  console.log(`Press Ctrl+C to stop the server`);
}); 