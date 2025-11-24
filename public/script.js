document.addEventListener('DOMContentLoaded', () => {
    const chatForm = document.getElementById('chat-form');
    const promptInput = document.getElementById('prompt-input');
    const chatContainer = document.getElementById('chat-container');
    const sendBtn = document.getElementById('send-btn');
    const welcomeMessage = document.querySelector('.welcome-message');

    let isFirstMessage = true;

    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const prompt = promptInput.value.trim();
        if (!prompt) return;

        // Clear input
        promptInput.value = '';

        // Remove welcome message on first chat
        if (isFirstMessage) {
            welcomeMessage.style.display = 'none';
            isFirstMessage = false;
        }

        // Add user message
        addMessage(prompt, 'user');

        // Show loading
        const loadingId = addLoadingIndicator();
        sendBtn.disabled = true;

        try {
            const response = await fetch('/query', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    prompt: prompt,
                    model: 'cloudflare'
                })
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.statusText}`);
            }

            const data = await response.json();

            // Remove loading
            removeMessage(loadingId);

            if (data.error) {
                addMessage(`Error: ${data.error}`, 'ai');
            } else {
                addMessage(data.answer, 'ai');
            }

        } catch (error) {
            removeMessage(loadingId);
            addMessage(`Sorry, something went wrong: ${error.message}`, 'ai');
        } finally {
            sendBtn.disabled = false;
            promptInput.focus();
        }
    });

    function addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', sender);

        const contentDiv = document.createElement('div');
        contentDiv.classList.add('message-content');

        if (sender === 'ai') {
            // Parse Markdown for AI responses and sanitize HTML
            contentDiv.innerHTML = DOMPurify.sanitize(marked.parse(text));
        } else {
            contentDiv.textContent = text;
        }

        messageDiv.appendChild(contentDiv);
        chatContainer.appendChild(messageDiv);
        scrollToBottom();
    }

    function addLoadingIndicator() {
        const id = 'loading-' + Date.now();
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', 'ai');
        messageDiv.id = id;

        const contentDiv = document.createElement('div');
        contentDiv.classList.add('typing-indicator');

        contentDiv.innerHTML = `
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        `;

        messageDiv.appendChild(contentDiv);
        chatContainer.appendChild(messageDiv);
        scrollToBottom();
        return id;
    }

    function removeMessage(id) {
        const element = document.getElementById(id);
        if (element) {
            element.remove();
        }
    }

    function scrollToBottom() {
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }
});
