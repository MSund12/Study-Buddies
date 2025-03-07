import Message from "../models/Message.js";
import { getIO } from "../sockets/chat.js";

export const sendMessage = async (req, res) => {
  try {
    const message = await Message.create({
      content: req.body.content,
      sender: req.user.id,
      group: req.params.groupId,
      readBy: [req.user.id], // Sender automatically marks as read
    });

    // WebSocket implementation
    const io = getIO();
    io.to(req.params.groupId).emit("new-message", message);

    res.status(201).json(message);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getMessages = async (req, res) => {
  try {
    const messages = await Message.find({ group: req.params.groupId })
      .sort({ createdAt: 1 })
      .populate("sender", "name email");
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
