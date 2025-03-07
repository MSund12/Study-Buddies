import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import { errorHandler } from "./utils/errorHandler.js";
import courseRoutes from "./routes/courseRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import { validateObjectId } from "./middleware/validateObjectId.js";
import { initWebSocket, getIO } from "./sockets/chat.js";
import groupRoutes from "./routes/groupRoutes.js";
import cors from "cors";
import { paginateResults } from "./middleware/pagination.js"; // Added
import Course from "./models/Course.js"; // Added

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
connectDB();

// Routes
app.use("/api/auth", authRoutes);
app.use(
  "/api/courses",
  validateObjectId,
  paginateResults(Course),
  courseRoutes
); // Added
app.use("/api/chat", validateObjectId, chatRoutes);
app.use("/api/groups", validateObjectId, groupRoutes);

// Error Handling
app.use(errorHandler);

const httpServer = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Initialize WebSocket
initWebSocket(httpServer);
