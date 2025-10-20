document.addEventListener('DOMContentLoaded', () => {
    const chatMessages = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');
    const deleteButton = document.getElementById('delete-button');
    const attachButton = document.getElementById('attach-button');
    const suggestionCards = document.querySelectorAll('.card');
    const settingsButton = document.getElementById('settings-button');
    const settingsPanel = document.getElementById('settings-panel');
    const closeSettingsButton = document.getElementById('close-settings');
    
    // Create a hidden file input element
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.style.display = 'none';
    fileInput.accept = 'image/*,.pdf,.doc,.docx,.txt';
    document.body.appendChild(fileInput);
    
    // Removed hardcoded API key; frontend will call backend proxy
    
    // Keep track of conversation history
    let conversationHistory = [];
    
    // Model and provider selection
    function getCurrentModel() {
        const modelSelect = document.getElementById('model-select');
        return modelSelect ? modelSelect.value : 'gpt-3.5-turbo';
    }
    
    function getCurrentProvider() {
        const providerSelect = document.getElementById('provider-select');
        return providerSelect ? providerSelect.value : 'auto';
    }

    // Helpers to format model content
    function escapeHtml(s) {
        return s
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function stripThinking(s) {
        // Remove <think>...</think> sections completely
        return s.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
    }

    function renderMarkdown(raw) {
        const text = escapeHtml(stripThinking(raw));
        let html = text;
        // Horizontal rules --- or ***
        html = html.replace(/^(?:-{3,}|\*{3,})$/gm, '<hr>');
        // Headings #, ##, ### (basic)
        html = html.replace(/^###\s+(.+)$/gm, '<h3>$1</h3>');
        html = html.replace(/^##\s+(.+)$/gm, '<h2>$1</h2>');
        html = html.replace(/^#\s+(.+)$/gm, '<h1>$1</h1>');
        // Blockquotes
        html = html.replace(/^>\s?(.+)$/gm, '<blockquote>$1</blockquote>');
        // Code blocks ```
        html = html.replace(/```([\s\S]*?)```/g, (_, code) => {
            const body = code.replace(/\n$/,'');
            return '<pre><code>' + body + '</code></pre>';
        });
        // Inline code `code`
        html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
        // Bold **text**
        html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
        // Italic *text*
        html = html.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>');
        // Links [text](url)
        html = html.replace(/\[([^\]]+)\]\((https?:[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
        // Lists: lines starting with - or *
        if (/^(\s*[-*] .+)(\n\s*[-*] .+)+/m.test(html)) {
            html = html.replace(/(?:^|\n)([-*] .+(?:\n[-*] .+)*)/g, (m) => {
                const items = m.split(/\n/).map(line => line.replace(/^[-*]\s+/, '')).filter(Boolean);
                return '<ul>' + items.map(i => '<li>' + i + '</li>').join('') + '</ul>';
            });
        }
        // Paragraph / line breaks
        html = html.replace(/\n\n+/g, '</p><p>');
        html = '<p>' + html.replace(/\n/g, '<br>') + '</p>';
        return html;
    }

    function addCopyToCodeBlocks(container) {
        const blocks = container.querySelectorAll('pre');
        blocks.forEach((pre) => {
            if (pre.querySelector('.code-copy')) return;
            const btn = document.createElement('button');
            btn.className = 'code-copy';
            btn.title = 'Copy code';
            btn.innerHTML = '<i class="fas fa-copy"></i>';
            btn.addEventListener('click', async () => {
                const text = pre.innerText;
                try {
                    await navigator.clipboard.writeText(text);
                    btn.classList.add('tool-success');
                    setTimeout(() => btn.classList.remove('tool-success'), 800);
                } catch {}
            });
            pre.style.position = 'relative';
            pre.appendChild(btn);
        });
    }

    function createBotToolbar(messageContentEl, plainText) {
        const tools = document.createElement('div');
        tools.className = 'message-tools';

        const copyBtn = document.createElement('button');
        copyBtn.type = 'button';
        copyBtn.className = 'tool-btn';
        copyBtn.title = 'Copy';
        copyBtn.innerHTML = '<i class="fas fa-copy"></i>';
        copyBtn.addEventListener('click', async () => {
            try {
                await navigator.clipboard.writeText(plainText);
                copyBtn.classList.add('tool-success');
                setTimeout(() => copyBtn.classList.remove('tool-success'), 800);
            } catch {}
        });

        const expandBtn = document.createElement('button');
        expandBtn.type = 'button';
        expandBtn.className = 'tool-btn';
        expandBtn.title = 'Toggle collapse';
        expandBtn.innerHTML = '<i class="fas fa-arrows-up-down"></i>';
        expandBtn.addEventListener('click', () => {
            messageContentEl.classList.toggle('collapsed');
        });

        tools.appendChild(copyBtn);
        tools.appendChild(expandBtn);
        return tools;
    }
    
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
            if (isUser) {
                messageContent.textContent = content;
            } else {
                messageContent.innerHTML = renderMarkdown(content);
                addCopyToCodeBlocks(messageContent);
                // Default: show full content (no auto-collapse)
                // Toolbar for manual toggle if user wants
                const plain = stripThinking(content);
                const tools = createBotToolbar(messageContent, plain);
                messageDiv.appendChild(tools);
            }
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
                content: isUser ? content : stripThinking(content)
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
    
    // Function to send message via backend proxy
    async function sendToGroq(userMessage) {
        try {
            showTypingIndicator();
            
            const response = await fetch('/.netlify/functions/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: getCurrentModel(),
                    messages: conversationHistory,
                    temperature: 0.7,
                    max_tokens: 800,
                    provider: getCurrentProvider()
                })
            });
            
            const maybeJson = await response.json().catch(() => null);
            if (!response.ok) {
                const errMsg = maybeJson?.error?.message || maybeJson?.error || response.statusText;
                throw new Error(errMsg);
            }
            
            const data = maybeJson || {};
            const botReply = data.choices?.[0]?.message?.content || '[No content]';
            
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
    
    // Event listeners for settings panel
    settingsButton.addEventListener('click', () => {
        settingsPanel.classList.toggle('hidden');
    });
    
    closeSettingsButton.addEventListener('click', () => {
        settingsPanel.classList.add('hidden');
    });
    
    // Close settings panel when clicking outside
    document.addEventListener('click', (e) => {
        if (!settingsPanel.contains(e.target) && !settingsButton.contains(e.target)) {
            settingsPanel.classList.add('hidden');
        }
    });
}); 