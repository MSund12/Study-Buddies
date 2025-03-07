import express from "express";
import {
  register,
  verifyEmail,
  login,
  logout,
  getProfile,
} from "../controllers/authController.js";
import { validateDomain } from "../middleware/validateDomain.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.post("/register", validateDomain, register);
router.get("/verify-email/:token", verifyEmail);
router.post("/login", login);
router.post("/logout", auth, logout);
router.get("/profile", auth, getProfile);

export default router;
