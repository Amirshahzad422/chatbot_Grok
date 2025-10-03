# OpenAI Chatbot

A modern web-based chatbot using the OpenAI API with a beautiful, responsive interface.

## Features

- 🤖 **AI Chat Interface** - Powered by OpenAI models (default: gpt-4o-mini)
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
   - Get your API key from the [OpenAI Platform](https://platform.openai.com/)
   - Edit the `.env` file and add `OPENAI_API_KEY=sk_your_actual_api_key_here`

3. **Start the server:**
   ```bash
   npm start
   ```

4. **Open your browser:**
   Navigate to `http://localhost:3001`

## API Key Setup

1. Visit the [OpenAI Platform](https://platform.openai.com/)
2. Create a new API key
3. Copy the key (starts with `sk-`)
4. Open the `.env` file in your project
5. Set `OPENAI_API_KEY` to your key

Example `.env` file:
```
OPENAI_API_KEY=sk_1234567890abcdef...
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
- Ensure the key starts with `sk-`
- Check that you have sufficient credits/limits in your OpenAI account

### File Upload Issues
- Supported formats: images (JPG, PNG, GIF, etc.), PDFs, documents
- Maximum file size: 1GB (limited by browser)

## License

MIT License - feel free to use this project for your own purposes!
