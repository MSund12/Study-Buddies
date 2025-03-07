// server/middleware/auth.js
import jwt from "jsonwebtoken";
import TokenBlacklist from "../models/TokenBlacklist.js"; // New model needed

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) throw new Error("Authentication required");

    // Check if token is blacklisted
    const isBlacklisted = await TokenBlacklist.exists({ token });
    if (isBlacklisted) throw new Error("Token revoked");

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: error.message || "Invalid token" });
  }
};

export default auth;
