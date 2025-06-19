# Grok Chatbot

A simple web-based chatbot interface that uses the Grok API to generate responses.

## Features

- Clean, modern UI
- Real-time chat interaction
- Typing indicators
- Support for Enter key to send messages
- Conversation history maintained during session

## How to Use

1. Open `index.html` in a web browser
2. Type your message in the input field
3. Press Enter or click the Send button
4. Wait for Grok to respond

## Technical Details

This chatbot uses:
- HTML5 for structure
- CSS3 for styling
- JavaScript (ES6+) for functionality
- Fetch API for making requests to the Grok API
- Grok's API via Groq's API endpoint

## API Key Security

**Important**: The API key is currently stored directly in the JavaScript file. For production use, consider:
- Using environment variables
- Implementing a backend service to handle API requests
- Using a proxy server to hide your API key

## Browser Compatibility

Works on all modern browsers:
- Chrome
- Firefox
- Safari
- Edge

## Troubleshooting

If you encounter issues:
1. Check your internet connection
2. Verify the API key is correct
3. Open browser developer tools (F12) to check for any JavaScript errors
4. Ensure CORS is not blocking the API requests # chatbot_Grok
