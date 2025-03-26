import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';
import userRoutes from './routes/userRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import groupRoutes from './routes/groupRoutes.js';  // Import groupRoutes


dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());

// Use the user routes
app.use('/api/users', userRoutes);
// Use the course routes
app.use('/api/courses', courseRoutes);
// Use the group routes
app.use('/api/groups', groupRoutes);


mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log("MongoDB Connected"))
  .catch(err => console.error("MongoDB Connection Failed:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
