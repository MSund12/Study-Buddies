import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import { StreamChat } from "stream-chat";

// Import Routes
import userRoutes from "./routes/userRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";
import groupRoutes from "./routes/groupRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
// import chatRoutes from "./routes/chatRoutes.js";

dotenv.config();
const app = express();
app.use(express.json());

// --- CORS Configuration ---
const allowedOrigins = [
  process.env.VITE_CLIENT_URL, // Use environment variable if set
  "http://localhost:5173",
  "http://localhost:5174", // Ensure this matches your actual frontend dev port
  // Add your deployed frontend URL here when you deploy
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.error(`CORS Error: Origin ${origin} not allowed.`); // Keep essential CORS error log
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
};

app.use(cors(corsOptions));
// --- End CORS Configuration ---

// Create HTTP server and attach Socket.io
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    // Re-use same CORS options for Socket.IO
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Use the routes
// Ensure middleware like express.json() and cors() are defined BEFORE these routes
app.use("/api/users", userRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/bookings", bookingRoutes); // Mounts all routes from bookingRoutes.js under /api/bookings
// app.use("/api/chat", chatRoutes);

// Stream Chat server initialization (if used)
// Ensure API_KEY and API_SECRET are correctly set in your .env file
if (process.env.API_KEY && process.env.API_SECRET) {
    const serverClient = StreamChat.getInstance(process.env.API_KEY, process.env.API_SECRET);

    // Token endpoint: generates a token for a given user
    app.get("/token", (req, res) => {
      const { userId } = req.query;
      if (!userId) {
        return res.status(400).send("userId is required");
      }
      // IMPORTANT: Add validation/authentication here in a real app
      try {
        const token = serverClient.createToken(userId);
        res.send({ token });
      } catch (error) {
        console.error("Error creating Stream token:", error); // Keep essential error log
        res.status(500).send("Error generating token");
      }
    });
} else {
     console.warn("Stream Chat API Key or Secret not found in environment variables. Stream Chat features disabled.");
}


// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    // Add any newer recommended options if needed, otherwise leave empty
  })
  .then(() => console.log("MongoDB Connected")) // Keep connection logs
  .catch((err) => console.error("MongoDB Connection Failed:", err)); // Keep connection error logs

// Optional: Basic Socket.io connection listener
// io.on("connection", (socket) => {
//   console.log("User connected via Socket.IO:", socket.id);
//   socket.on("disconnect", () => {
//     console.log("User disconnected via Socket.IO:", socket.id);
//   });
// });

// Define PORT and Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`)); // Keep server start log