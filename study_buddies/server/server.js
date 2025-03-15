<<<<<<< HEAD
import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';
import userRoutes from './routes/userRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import groupRoutes from './routes/groupRoutes.js';  // Import groupRoutes
=======
import express from "express";
import connectDB from "./config/db.js";

// Determine which repository to use based on an environment variable
const useStub = process.env.DB_MODE === "stub";
const userRepository = useStub
  ? (await import("./repositories/userRepositoryStub.js")).default
  : (await import("./repositories/userRepository.js")).default;

import userRoutes from "./routes/userRoutes.js";
>>>>>>> f1c13e3ffe33ace1151ba084565bf4aa8fb013df

const app = express();

// Connect to MongoDB only if not using the stub
if (!useStub) {
  await connectDB();
}

app.use(express.json());

<<<<<<< HEAD
// Use the user routes
app.use('/api/users', userRoutes);
// Use the course routes
app.use('/api/courses', courseRoutes);
// Use the group routes
app.use('/api/groups', groupRoutes);
=======
// Inject the repository into each request
app.use((req, res, next) => {
  req.userRepository = userRepository;
  next();
});
>>>>>>> f1c13e3ffe33ace1151ba084565bf4aa8fb013df

app.use("/users", userRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

export default app;
