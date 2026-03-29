import { apiFetch } from '../api.js';

export function initChatbot() {
  const chatHTML = `
    <div id="chatbot-container" class="chatbot-closed">
      <button id="chatbot-toggle" class="chatbot-toggle">
        <span class="chat-icon">💬</span>
        <span class="close-icon">✕</span>
      </button>
      
      <div id="chatbot-window" class="chatbot-window">
        <div class="chatbot-header">
          <div>
            <h3>Event Assistant 🎉</h3>
            <p>Ask me about packages & pricing</p>
          </div>
          <button id="chatbot-close" class="chatbot-close-btn">✕</button>
        </div>
        
        <div id="chatbot-messages" class="chatbot-messages">
          <div class="chat-message bot">
            <div class="message-content">
              Hi! I'm your event planning assistant. Ask me about our packages, pricing, or help choosing options for your event! 🎊
            </div>
          </div>
        </div>
        
        <div class="chatbot-input-container">
          <input 
            type="text" 
            id="chatbot-input" 
            placeholder="Ask about packages, pricing..."
            autocomplete="off"
          />
          <button id="chatbot-send" class="chatbot-send-btn">
            <span>➤</span>
          </button>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', chatHTML);

  let conversationHistory = [];
  let isOpen = false;

  const container = document.getElementById('chatbot-container');
  const toggle = document.getElementById('chatbot-toggle');
  const closeBtn = document.getElementById('chatbot-close');
  const input = document.getElementById('chatbot-input');
  const sendBtn = document.getElementById('chatbot-send');
  const messagesContainer = document.getElementById('chatbot-messages');

  function toggleChat() {
    isOpen = !isOpen;
    container.classList.toggle('chatbot-open', isOpen);
    container.classList.toggle('chatbot-closed', !isOpen);
    if (isOpen) input.focus();
  }

  toggle.addEventListener('click', toggleChat);
  closeBtn.addEventListener('click', toggleChat);

  async function sendMessage() {
    const message = input.value.trim();
    if (!message) return;

    // Add user message
    addMessage(message, 'user');
    input.value = '';

    // Show typing indicator
    const typingId = addTypingIndicator();

    try {
      const response = await apiFetch('/chat', {
        method: 'POST',
        body: JSON.stringify({ message, conversationHistory })
      });

      removeTypingIndicator(typingId);
      addMessage(response.message, 'bot');
      conversationHistory = response.conversationHistory;
    } catch (err) {
      removeTypingIndicator(typingId);
      addMessage('Sorry, I encountered an error. Please try again.', 'bot');
    }
  }

  function addMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${sender}`;
    
    // Format the message text
    let formattedText = text
      // Convert ### headers to h3
      .replace(/###\s*(.+)/g, '<h3>$1</h3>')
      // Convert ** bold ** to strong
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      // Convert * list items to ul/li
      .replace(/^\*\s+(.+)$/gm, '<li>$1</li>')
      // Wrap consecutive li in ul
      .replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
      // Convert line breaks
      .replace(/\n/g, '<br>');
    
    messageDiv.innerHTML = `<div class="message-content">${formattedText}</div>`;
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  function addTypingIndicator() {
    const id = 'typing-' + Date.now();
    const typingDiv = document.createElement('div');
    typingDiv.id = id;
    typingDiv.className = 'chat-message bot typing';
    typingDiv.innerHTML = `
      <div class="message-content">
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
      </div>
    `;
    messagesContainer.appendChild(typingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    return id;
  }

  function removeTypingIndicator(id) {
    document.getElementById(id)?.remove();
  }

  sendBtn.addEventListener('click', sendMessage);
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
  });
}
