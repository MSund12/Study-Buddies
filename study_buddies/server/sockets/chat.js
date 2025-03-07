// server/sockets/chat.js
import { Server } from "socket.io";
import Message from "../models/Message.js";

let io;

export const initWebSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL,
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Join room for specific group
    socket.on("join-group", (groupId) => {
      socket.join(groupId);
      console.log(`User joined group ${groupId}`);
    });

    // Handle new messages with proper async
    socket.on("send-message", async (messageData, callback) => {
      try {
        const savedMessage = await Message.create({
          content: messageData.content,
          sender: messageData.senderId,
          group: messageData.groupId,
          readBy: [messageData.senderId],
        });

        io.to(messageData.groupId).emit("new-message", savedMessage);
        callback({ status: "success", message: savedMessage });
      } catch (error) {
        console.error("Message save error:", error);
        callback({ status: "error", message: "Failed to send message" });
      }
    });

    // Handle read receipts with async
    socket.on("mark-read", async ({ messageId, userId }, callback) => {
      try {
        await Message.updateOne(
          { _id: messageId },
          { $addToSet: { readBy: userId } }
        );
        socket.broadcast.emit("read-receipt", { messageId, userId });
        callback({ status: "success" });
      } catch (error) {
        console.error("Read receipt error:", error);
        callback({ status: "error" });
      }
    });

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });
};

export const getIO = () => io;
