# Grok Chatbot

A modern web-based chatbot using the Groq API with a beautiful, responsive interface.

## Features

- 🤖 **AI Chat Interface** - Powered by Groq's deepseek-r1-distill-llama-70b model
- 📁 **File Upload Support** - Upload images, PDFs, and other documents
- 🎨 **Modern UI** - Dark theme with responsive design
- 📝 **Markdown Support** - Rich text formatting in responses
- 📋 **Code Copy** - One-click copy for code blocks
- 🔧 **Message Tools** - Copy and expand/collapse long messages

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up your API key:**
   - Get your API key from [Groq Console](https://console.groq.com/keys)
   - Edit the `.env` file and replace `gsk_your_actual_api_key_here` with your actual API key

3. **Start the server:**
   ```bash
   npm start
   ```

4. **Open your browser:**
   Navigate to `http://localhost:3001`

## API Key Setup

1. Visit [Groq Console](https://console.groq.com/keys)
2. Create a new API key
3. Copy the key (starts with `gsk_`)
4. Open the `.env` file in your project
5. Replace `gsk_your_actual_api_key_here` with your actual key

Example `.env` file:
```
GROQ_API_KEY=gsk_1234567890abcdef...
PORT=3001
```

## Available Scripts

- `npm start` - Start the server on port 3001
- `npm run dev` - Start the server in development mode
- `npm run build` - Build the project (no build step required)

## Project Structure

```
├── index.html          # Main HTML file
├── styles.css          # CSS styling
├── script.js           # Frontend JavaScript
├── server.js           # Node.js server
├── package.json        # Project configuration
├── .env               # Environment variables
└── README.md          # This file
```

## Troubleshooting

### Port Already in Use
If you get a "port already in use" error:
- The server is configured to use port 3001 by default
- You can change the port in the `.env` file

### API Key Issues
- Make sure your API key is correctly set in the `.env` file
- Ensure the key starts with `gsk_`
- Check that you have sufficient credits in your Groq account

### File Upload Issues
- Supported formats: images (JPG, PNG, GIF, etc.), PDFs, documents
- Maximum file size: 1GB (limited by browser)

## License

MIT License - feel free to use this project for your own purposes!
