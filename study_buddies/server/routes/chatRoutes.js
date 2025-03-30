import express from 'express';
import ChatMessage from '../models/Chat.js';

const router = express.Router();

// Route to store a chat message
router.post('/messages', async (req, res) => {
  try {
    const { sender, receiver, message, chatId } = req.body;
    const newMessage = new ChatMessage({ sender, receiver, message, chatId });
    await newMessage.save();
    res.status(201).json(newMessage);
  } catch (error) {
    console.error('Error storing message:', error);
    res.status(500).json({ error: 'Failure to Store Message' });
  }
});

// Route to retrieve chat messages
router.get('/messages', async (req, res) => {
  try {
    const { sender, receiver, chatId } = req.query;
    let messages;
    if (chatId) {
      messages = await ChatMessage.find({ chatId }).sort({ timestamp: 1 });
    } else {
      messages = await ChatMessage.find({
        $or: [{ sender, receiver }, { sender: receiver, receiver: sender }],
      }).sort({ timestamp: 1 });
    }
    res.json(messages);
  } catch (error) {
    console.error('Error retrieving messages:', error);
    res.status(500).json({ error: 'Failure to retrieve messages' });
  }
});

export default router;