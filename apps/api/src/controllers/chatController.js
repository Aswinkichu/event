const chatService = require('../services/chatService');

exports.chat = async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;
    
    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    const response = await chatService.chat(message, conversationHistory);
    res.json(response);
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ message: 'Failed to process chat request' });
  }
};
