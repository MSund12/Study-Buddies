import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors"; // Make sure cors is installed: npm install cors
import http from "http";
import { Server } from "socket.io";
import { StreamChat } from "stream-chat"; // Import StreamChat

// Import Routes
import userRoutes from "./routes/userRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";
import groupRoutes from "./routes/groupRoutes.js";
// import chatRoutes from "./routes/chatRoutes.js"; // Assuming chatRoutes might be added later

// Import models - Assuming these are used by your routes, keep imports if needed
// import Chat from "./models/Chat.js";
// import User from "./models/User.js";

dotenv.config();
const app = express();
app.use(express.json());

// --- CORS Configuration Update ---
// Define the origins allowed to access your backend
const allowedOrigins = [
  process.env.VITE_CLIENT_URL, // Use environment variable if set
  "http://localhost:5173", // Keep the previous default (just in case)
  "http://localhost:5174", // Add your frontend origin <--- FIX
  // Add your deployed frontend URL here when you deploy
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, Postman) OR origins in our allowed list
    // During development, you might want to uncomment `!origin` to allow tools like Postman
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.error(`CORS Error: Origin ${origin} not allowed.`); // Log blocked origins
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE"], // Methods your frontend will use
  credentials: true, // Important if you need to send cookies or authorization headers
};

// Apply CORS middleware for Express
app.use(cors(corsOptions));
// --- End CORS Configuration Update ---

// Create HTTP server and attach Socket.io
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    // Apply similar CORS options to Socket.IO
    origin: function (origin, callback) {
      // Allow requests with no origin OR origins in our allowed list
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
app.use("/api/users", userRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/groups", groupRoutes);
// app.use("/api/chat", chatRoutes);

// Stream Chat server initialization

const serverClient = StreamChat.getInstance(process.env.API_KEY, process.env.API_SECRET);

// Token endpoint: generates a token for a given user
app.get("/token", (req, res) => {
  const { userId } = req.query;
  if (!userId) {
    return res.status(400).send("userId is required");
  }
  // IMPORTANT: Add validation/authentication here in a real app
  // to ensure only authorized users can get tokens for specific user IDs.
  try {
    const token = serverClient.createToken(userId);
    res.send({ token });
  } catch (error) {
    console.error("Error creating Stream token:", error);
    res.status(500).send("Error generating token");
  }
});

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    // Removed deprecated options
  })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB Connection Failed:", err));

// (Optional) Socket.io connection handling
// io.on("connection", (socket) => {
//   console.log("User connected:", socket.id);
//   // Your socket logic here...
//   socket.on("disconnect", () => {
//     console.log("User disconnected:", socket.id);
//   });
// });

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));