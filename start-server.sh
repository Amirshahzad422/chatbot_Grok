#!/bin/bash

# AI Chatbot Server Startup Script

echo "🔄 Stopping any existing servers..."
lsof -ti:3001 | xargs kill -9 2>/dev/null || true
pkill -f "node server.js" 2>/dev/null || true

echo "⏳ Waiting for port to be free..."
sleep 2

echo "🚀 Starting AI Chatbot Server..."
node server.js
