// server/models/TokenBlacklist.js
import mongoose from "mongoose";

const tokenBlacklistSchema = new mongoose.Schema({
  token: { type: String, required: true, unique: true },
  expiresAt: { type: Date, default: Date.now, expires: "7d" }, // Auto-delete after 7 days
});

export default mongoose.model("TokenBlacklist", tokenBlacklistSchema);
