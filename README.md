# 🤖 AI-Powered Chatbot with Multi-Provider Support

[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![OpenAI](https://img.shields.io/badge/OpenAI-412991?style=for-the-badge&logo=openai&logoColor=white)](https://openai.com/)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)

A sophisticated web-based AI chatbot application that provides seamless conversational AI experiences through multiple API providers. Built with modern web technologies, featuring intelligent responses, file upload capabilities, and a beautiful dark-themed interface.

## 🌟 Features

- **🔄 Multi-Provider AI Integration** - Support for OpenAI and Groq APIs
- **💬 Real-time Chat Interface** - Instant messaging with typing indicators
- **📁 File Upload & Image Analysis** - AI-powered image description
- **📝 Markdown Response Rendering** - Rich text formatting support
- **📋 Copy-to-Clipboard Functionality** - Easy code and text copying
- **💾 Conversation History Management** - Persistent chat sessions
- **⚙️ Settings Panel** - Choose between different AI models
- **📱 Responsive Mobile Design** - Optimized for all screen sizes
- **🌙 Dark Theme UI** - Modern, eye-friendly interface
- **🔒 Secure API Key Management** - Environment-based configuration

## 🚀 Demo

![Chatbot Interface](https://via.placeholder.com/800x400/1e2430/ffffff?text=AI+Chatbot+Interface)

**Live Demo:** [http://localhost:3001](http://localhost:3001) *(when running locally)*

## 🛠️ Technologies Used

### Backend
- **Node.js** - Runtime environment
- **Custom HTTP Server** - Lightweight server implementation
- **Fetch API** - HTTP client for API requests

### Frontend
- **HTML5** - Semantic markup structure
- **CSS3** - Advanced styling with animations
- **JavaScript ES6+** - Modern JavaScript features
- **Font Awesome** - Icon library

### APIs & Services
- **OpenAI API** - GPT models integration
- **Groq API** - Alternative AI provider

## 📦 Installation

### Prerequisites
- Node.js (v14.0.0 or higher)
- Valid OpenAI API key or Groq API key

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/ai-chatbot.git
   cd ai-chatbot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   # OpenAI API Configuration
   OPENAI_API_KEY=your_openai_api_key_here
   
   # Groq API Configuration (Optional)
   GROQ_API_KEY=your_groq_api_key_here
   
   # Server Configuration
   PORT=3001
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3001](http://localhost:3001)

## 🔑 Getting API Keys

### OpenAI API Key
1. Visit [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign up or log in to your account
3. Create a new API key
4. Copy the key to your `.env` file

### Groq API Key (Optional)
1. Visit [Groq Console](https://console.groq.com/keys)
2. Sign up for a free account
3. Generate an API key
4. Add to your `.env` file

## 🎮 Usage

### Basic Chat
1. Type your message in the input field
2. Press Enter or click the send button
3. Wait for the AI response

### Model Selection
1. Click the settings button (⚙️) in the header
2. Choose your preferred provider (OpenAI/Groq)
3. Select a specific model
4. Close settings and start chatting

### File Upload
1. Click the attachment button (📎)
2. Select an image file
3. The AI will analyze and describe the image

### Available Models

#### OpenAI Models
- **GPT-4** - Advanced reasoning capabilities
- **GPT-4 Turbo** - Latest and most capable model
- **GPT-3.5 Turbo** - Fast and efficient for most tasks
- **O1 Preview** - Advanced reasoning model
- **O1 Mini** - Compact reasoning model

#### Groq Models
- **DeepSeek R1 Distill Llama 70B** - High-performance model
- **Llama 3.3 70B Versatile** - Versatile conversational AI
- **Llama 3.1 70B Versatile** - Reliable general-purpose model
- **Mixtral 8x7B** - Efficient mixture of experts model

## 📁 Project Structure

```
ai-chatbot/
├── server.js              # Main server file with API proxy
├── index.html             # Frontend HTML structure
├── script.js              # Frontend JavaScript logic
├── styles.css             # CSS styling and animations
├── package.json           # Project dependencies and scripts
├── .env                   # Environment variables (not in repo)
├── .gitignore            # Git ignore rules
├── start-server.sh       # Server startup script
├── 404.html              # Custom error page
└── README.md             # Project documentation
```

## 🔧 Configuration

### Environment Variables
- `OPENAI_API_KEY` - Your OpenAI API key
- `GROQ_API_KEY` - Your Groq API key (optional)
- `PORT` - Server port (default: 3001)

### Server Scripts
- `npm run dev` - Start development server
- `npm start` - Start production server
- `./start-server.sh` - Alternative startup script

## 🛡️ Security Features

- **Environment Variable Protection** - API keys stored securely
- **Server-side API Handling** - No client-side key exposure
- **Input Validation** - Request sanitization and validation
- **Error Boundary** - Graceful error handling and recovery

## 🚀 Deployment

### Local Development
```bash
npm run dev
```

### Production Deployment Options

#### Heroku
1. Create a new Heroku app
2. Set environment variables in Heroku dashboard
3. Deploy using Git or GitHub integration

#### Vercel
1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard:
   - `OPENAI_API_KEY` - Your OpenAI API key
   - `GROQ_API_KEY` - Your Groq API key (optional)
3. Deploy with automatic builds
4. The `vercel.json` configuration handles the deployment automatically

#### Railway/Render
1. Connect repository
2. Set environment variables
3. Deploy with one-click deployment

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Amir** - *Full Stack Developer*

- GitHub: [@yourusername](https://github.com/yourusername)
- LinkedIn: [Your LinkedIn](https://linkedin.com/in/yourprofile)

## 🙏 Acknowledgments

- [OpenAI](https://openai.com/) for providing GPT API access
- [Groq](https://groq.com/) for alternative AI model access
- [Font Awesome](https://fontawesome.com/) for the icon library
- The open-source community for inspiration and best practices

## 📊 Project Stats

- **Language:** JavaScript
- **Framework:** Vanilla JS + Node.js
- **API Integration:** OpenAI, Groq
- **Responsive:** ✅ Mobile-friendly
- **Dark Theme:** ✅ Modern UI
- **File Upload:** ✅ Image analysis

---

⭐ **Star this repository if you found it helpful!**

## 🐛 Issues & Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/yourusername/ai-chatbot/issues) page
2. Create a new issue with detailed information
3. Include error messages and steps to reproduce

## 🔄 Updates & Roadmap

### Recent Updates
- ✅ Multi-provider API support
- ✅ Settings panel for model selection
- ✅ File upload functionality
- ✅ Improved error handling

### Future Enhancements
- 🔄 User authentication system
- 🔄 Chat history persistence
- 🔄 Additional AI providers
- 🔄 Voice input/output
- 🔄 Real-time collaboration

---

*Built with ❤️ by Amir - Showcasing modern web development and AI integration*