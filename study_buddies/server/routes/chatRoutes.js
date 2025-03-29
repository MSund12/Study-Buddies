import express from "express";
import Chat from "../models/Chat.js";
import User from "../models/User.js";

const router = express.Router();

// Get all distinct chat rooms
router.get("/rooms", async (req, res) => {
  try {
    const rooms = await Chat.distinct("chatId");
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch rooms" });
  }
});

// Get all messages for a specific chat room
router.get("/messages/:chatId", async (req, res) => {
  try {
    const messages = await Chat.find({ chatId: req.params.chatId }).sort({
      createdAt: 1,
    });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

// Get all one-on-one chats for a user
router.get("/direct/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    // Find chats where the user is either sender or receiver
    const chats = await Chat.find({
      $or: [{ sender: userId }, { receiver: userId }],
    }).sort({ createdAt: -1 });

    // Extract unique chatIds
    const chatIds = [...new Set(chats.map((chat) => chat.chatId))];

    // For each chatId, get the latest message
    const latestMessages = await Promise.all(
      chatIds.map(async (chatId) => {
        const message = await Chat.findOne({ chatId })
          .sort({ createdAt: -1 })
          .populate("receiver", "firstName lastName");
        return message;
      })
    );

    res.json(latestMessages);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch direct chats" });
  }
});

// Create a new message (REST API alternative to Socket.io)
router.post("/messages", async (req, res) => {
  try {
    const { chatId, sender, receiver, text } = req.body;
    if (!chatId || !sender || !text) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Find the sender to get their firstName and lastName
    const user = await User.findById(sender);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const fullName = `${user.firstName} ${user.lastName}`;

    const message = new Chat({
      chatId,
      sender,
      senderInfo: {
        fullName,
      },
      receiver, // For group chats, this may be null
      text,
    });

    await message.save();
    res.status(201).json(message);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to create message", details: error.message });
  }
});

// Get users in a chat room
router.get("/rooms/:chatId/users", async (req, res) => {
  try {
    const chatId = req.params.chatId;
    // Find distinct senders in this chat
    const uniqueSenders = await Chat.distinct("sender", { chatId });
    // Find distinct receivers if present
    const uniqueReceivers = await Chat.distinct("receiver", {
      chatId,
      receiver: { $ne: null },
    });
    // Combine and remove duplicates
    const uniqueUserIds = [...new Set([...uniqueSenders, ...uniqueReceivers])];
    // Get detailed user information (fetching firstName, lastName, email, etc.)
    const users = await User.find(
      { _id: { $in: uniqueUserIds } },
      "firstName lastName email isAdmin isVerified"
    );
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch room users" });
  }
});

export default router;
