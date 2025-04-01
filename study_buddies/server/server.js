import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import userRoutes from './routes/userRoutes.js';
// Import other routes as needed

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000/',
  credentials: true
}));

// Routes
app.use('/api/users', userRoutes);
// Add other routes here

// Export the Express app without starting the server
export default app;

// Only start server when not in test environment
if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 5000;
  const server = app.listen(PORT, () => {
    console.log('Server running on port ${PORT}');
  });

  // Database connection for non-test environments
  mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Connected"))
    .catch((err) => console.error("MongoDB Connection Failed:", err));
}