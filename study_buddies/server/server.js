import express from "express";
import connectDB from "./config/db.js";

// Determine which repository to use based on an environment variable
const useStub = process.env.DB_MODE === "stub";
const userRepository = useStub
  ? (await import("./repositories/userRepositoryStub.js")).default
  : (await import("./repositories/userRepository.js")).default;

import userRoutes from "./routes/userRoutes.js";

const app = express();

// Connect to MongoDB only if not using the stub
if (!useStub) {
  await connectDB();
}

app.use(express.json());

// Inject the repository into each request
app.use((req, res, next) => {
  req.userRepository = userRepository;
  next();
});

app.use("/users", userRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

export default app;
