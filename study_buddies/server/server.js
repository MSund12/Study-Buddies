import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";

// Import Routes
import userRoutes from "./routes/userRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";
import groupRoutes from "./routes/groupRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";

//Import models
import Chat from "./models/Chat.js";
import User from "./models/User.js";

dotenv.config();
const app = express();
app.use(express.json());
app.use(
  cors({
    origin: process.env.VITE_CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// Create HTTP server and attach Socket.io
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.VITE_CLIENT_URL || "http://localhost:5173", // Match your Vite client
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Use the user routes
app.use("/api/users", userRoutes);
// Use the course routes
app.use("/api/courses", courseRoutes);
// Use the group routes
app.use("/api/groups", groupRoutes);
app.use("/api/chat", chatRoutes);

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB Connection Failed:", err));

// Socket.io connection handling
io.on("connection", (socket) => {
  socket.on("new_room", (room) => {
    io.emit("room_created", room);
  });

  // Listen for chat messages
  socket.on("send_message", async (messageData) => {
    try {
      const { chatId, sender, receiver, text } = messageData;

      // Find the sender to get their full name
      const user = await User.findById(sender);
      if (!user) {
        socket.emit("error", { message: "User not found" });
        return;
      }
      const fullName = `${user.firstName} ${user.lastName}`;

      // Save message to database with sender info
      const message = new Chat({
        chatId,
        sender,
        senderInfo: {
          fullName,
        },
        receiver,
        text,
      });
      await message.save();

      // Broadcast the message to the chat room
      io.to(chatId).emit("receive_message", {
        _id: message._id,
        chatId: message.chatId,
        sender: message.sender,
        senderInfo: message.senderInfo,
        receiver: message.receiver,
        text: message.text,
        createdAt: message.createdAt,
        updatedAt: message.updatedAt,
      });

      // For direct messages, also emit to the receiver's personal room
      if (receiver) {
        socket.to(receiver.toString()).emit("new_direct_message", {
          _id: message._id,
          chatId: message.chatId,
          sender: message.sender,
          senderInfo: message.senderInfo,
          receiver: message.receiver,
          text: message.text,
          createdAt: message.createdAt,
          updatedAt: message.updatedAt,
        });
      }
    } catch (error) {
      console.error("Error saving message:", error);
      socket.emit("error", { message: "Failed to send message" });
    }
  });

  // Handle typing indicator
  socket.on("typing", (data) => {
    socket.to(data.chatId).emit("user_typing", {
      user: data.user,
      isTyping: data.isTyping,
    });
  });

  // Get chat history for a room
  socket.on("get_messages", async (chatId) => {
    try {
      const messages = await Chat.find({ chatId })
        .sort({ createdAt: 1 })
        .limit(50);
      socket.emit("message_history", messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      socket.emit("error", { message: "Failed to fetch message history" });
    }
  });

  // Join personal room for direct message notifications
  socket.on("join_personal", (userId) => {
    if (userId) {
      socket.join(userId.toString());
      console.log(`User ${socket.id} joined personal room: ${userId}`);
    }
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
