document.addEventListener('DOMContentLoaded', () => {
    const chatMessages = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');
    const deleteButton = document.getElementById('delete-button');
    const attachButton = document.getElementById('attach-button');
    const suggestionCards = document.querySelectorAll('.card');
    
    // Create a hidden file input element
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.style.display = 'none';
    fileInput.accept = 'image/*,.pdf,.doc,.docx,.txt';
    document.body.appendChild(fileInput);
    
    // Your Groq API key
    const apiKey = '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';
    
    // Keep track of conversation history
    let conversationHistory = [];
    
    // Auto-resize textarea as user types
    userInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
        // Limit to 5 rows max
        if (this.scrollHeight > 150) {
            this.style.overflowY = 'auto';
            this.style.height = '150px';
        } else {
            this.style.overflowY = 'hidden';
        }
    });
    
    // Function to add a message to the chat UI
    function addMessage(content, isUser = false, isFile = false, fileData = null) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isUser ? 'user' : 'bot'}`;
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        
        if (isFile && fileData) {
            // Handle file content
            if (fileData.type.startsWith('image/')) {
                // For images
                const img = document.createElement('img');
                img.src = fileData.url;
                img.alt = fileData.name;
                img.style.maxWidth = '100%';
                img.style.maxHeight = '200px';
                img.style.borderRadius = '8px';
                
                const fileInfo = document.createElement('div');
                fileInfo.textContent = fileData.name;
                fileInfo.style.marginTop = '5px';
                fileInfo.style.fontSize = '0.8rem';
                fileInfo.style.opacity = '0.8';
                
                messageContent.appendChild(img);
                messageContent.appendChild(fileInfo);
            } else {
                // For other file types
                const fileIcon = document.createElement('div');
                fileIcon.innerHTML = '<i class="fas fa-file"></i>';
                fileIcon.style.fontSize = '2rem';
                fileIcon.style.marginBottom = '5px';
                
                const fileName = document.createElement('div');
                fileName.textContent = fileData.name;
                
                const fileSize = document.createElement('div');
                fileSize.textContent = `${(fileData.size / 1024).toFixed(1)} KB`;
                fileSize.style.fontSize = '0.8rem';
                fileSize.style.opacity = '0.8';
                
                messageContent.appendChild(fileIcon);
                messageContent.appendChild(fileName);
                messageContent.appendChild(fileSize);
            }
        } else {
            // Regular text message
            messageContent.textContent = content;
        }
        
        if (!isUser) {
            // Add star icon for bot messages
            const messageIcon = document.createElement('div');
            messageIcon.className = 'message-icon';
            messageIcon.innerHTML = '<i class="fas fa-star"></i>';
            messageDiv.appendChild(messageIcon);
        }
        
        messageDiv.appendChild(messageContent);
        chatMessages.appendChild(messageDiv);
        
        // Scroll to the bottom of the chat
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // Add to conversation history (don't add file metadata to conversation history)
        if (!isFile) {
            conversationHistory.push({
                role: isUser ? "user" : "assistant",
                content: content
            });
        } else {
            // For files, just add a text description to the conversation
            conversationHistory.push({
                role: "user",
                content: `[Shared a file: ${fileData.name}]`
            });
        }
    }
    
    // Function to show typing indicator
    function showTypingIndicator() {
        const indicator = document.createElement('div');
        indicator.className = 'message bot';
        indicator.id = 'typing-indicator';
        
        const indicatorContent = document.createElement('div');
        indicatorContent.className = 'typing-indicator';
        
        for (let i = 0; i < 3; i++) {
            const dot = document.createElement('span');
            indicatorContent.appendChild(dot);
        }
        
        indicator.appendChild(indicatorContent);
        chatMessages.appendChild(indicator);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // Function to remove typing indicator
    function removeTypingIndicator() {
        const indicator = document.getElementById('typing-indicator');
        if (indicator) {
            indicator.remove();
        }
    }
    
    // Function to send message to Groq API
    async function sendToGroq(userMessage) {
        try {
            showTypingIndicator();
            
            // Groq API endpoint
            const endpoint = 'https://api.groq.com/openai/v1/chat/completions';
            
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: 'llama3-70b-8192',  // Using Llama 3 70B model
                    messages: conversationHistory,
                    temperature: 0.7,
                    max_tokens: 800
                })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`API Error: ${errorData.error?.message || response.statusText}`);
            }
            
            const data = await response.json();
            const botReply = data.choices[0].message.content;
            
            removeTypingIndicator();
            addMessage(botReply);
            
        } catch (error) {
            console.error('Error:', error);
            removeTypingIndicator();
            addMessage(`Sorry, I encountered an error: ${error.message}`);
        }
    }
    
    // Function to clear chat history
    function clearChat() {
        // Clear UI
        chatMessages.innerHTML = '';
        
        // Reset conversation history
        conversationHistory = [];
    }
    
    // Function to handle file selection
    function handleFileSelect(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        
        reader.onload = function(e) {
            const fileData = {
                name: file.name,
                type: file.type,
                size: file.size,
                url: e.target.result
            };
            
            // Display the file in chat
            addMessage('', true, true, fileData);
            
            // If it's an image, we can send it to the AI
            if (file.type.startsWith('image/')) {
                sendToGroq(`I've uploaded an image named ${file.name}. Please describe what you see in this image.`);
            } else {
                // For other file types
                sendToGroq(`I've shared a file named ${file.name} (${file.type}). Please acknowledge.`);
            }
        };
        
        if (file.type.startsWith('image/')) {
            reader.readAsDataURL(file);
        } else {
            // For non-image files, we don't need the actual content
            reader.readAsArrayBuffer(file.slice(0, 1024)); // Just read a bit to confirm it's a valid file
            reader.onload = function() {
                const fileData = {
                    name: file.name,
                    type: file.type,
                    size: file.size,
                    url: null
                };
                
                // Display the file in chat
                addMessage('', true, true, fileData);
                
                // Send a message about the file
                sendToGroq(`I've shared a file named ${file.name} (${file.type}). Please acknowledge.`);
            };
        }
    }
    
    // Event listener for send button
    sendButton.addEventListener('click', () => {
        const message = userInput.value.trim();
        if (message) {
            addMessage(message, true);
            userInput.value = '';
            userInput.style.height = 'auto';
            sendToGroq(message);
        }
    });
    
    // Event listener for Enter key
    userInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendButton.click();
        }
    });
    
    // Event listener for delete button
    deleteButton.addEventListener('click', () => {
        clearChat();
    });
    
    // Event listeners for suggestion cards
    suggestionCards.forEach(card => {
        card.addEventListener('click', () => {
            const suggestionText = card.querySelector('.card-content p').textContent;
            userInput.value = suggestionText;
            sendButton.click();
        });
    });
    
    // Event listener for attach button
    attachButton.addEventListener('click', () => {
        fileInput.click();
    });
    
    // Event listener for file input change
    fileInput.addEventListener('change', handleFileSelect);
}); 