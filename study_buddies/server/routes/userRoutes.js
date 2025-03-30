// routes/userRoutes.js
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import TempUser from '../models/TempUser.js';

const router = express.Router();

// Generate JWT Token Function
const generateToken = (res, userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 1000, // 1 hour
  });
  return token;
};

// Helper Function: Generate a 6-digit verification code
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// ---------- Registration Route (Using TempUser) ----------
router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "User already exists" });

    let tempUser = await TempUser.findOne({ email });
    if (tempUser) {
      return res.status(400).json({
        message: "A registration is already pending. Please check your email for the verification code."
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const verificationCode = generateVerificationCode();
    const codeExpiry = new Date(Date.now() + 60 * 60 * 1000);

    tempUser = new TempUser({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      VerifCode: verificationCode,
      CodeExpiry: codeExpiry
    });
    await tempUser.save();

    res.status(201).json({
      message: "User registered successfully! A verification code has been sent to your email."
    });
  } catch (err) {
    console.error("Registration Error:", err);
    res.status(500).json({ message: "Server error during registration" });
  }
});

// ---------- Verification Route ----------
router.post('/verify', async (req, res) => {
  try {
    const { email, verificationCode } = req.body;

    const tempUser = await TempUser.findOne({ email });
    if (!tempUser) {
      return res.status(400).json({ message: "No pending registration for this email." });
    }

    if (tempUser.VerifCode !== verificationCode) {
      return res.status(400).json({ message: "Invalid verification code." });
    }

    if (tempUser.CodeExpiry < Date.now()) {
      return res.status(400).json({ message: "Verification code expired. Please register again." });
    }

    const newUser = new User({
      firstName: tempUser.firstName,
      lastName: tempUser.lastName,
      email: tempUser.email,
      password: tempUser.password,
      isVerified: true,
    });
    await newUser.save();

    await TempUser.deleteOne({ email });

    const token = generateToken(res, newUser._id);

    res.status(201).json({
      message: "User verified successfully.",
      token,
      user: {
        id: newUser._id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
      }
    });
  } catch (err) {
    console.error("Verification Error:", err);
    res.status(500).json({ message: "Server error during verification" });
  }
});

// ---------- User Login Route ----------
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !user.isVerified) {
         return res.status(400).json({ message: "User not found or not verified. Please sign up and verify your account." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = generateToken(res, user._id);

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      }
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "Server error during login" });
  }
});

// ---------- Protected Route Example (Requires Token) ----------
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        isAdmin: user.isAdmin,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    });
  } catch (err) {
    console.error("Get Profile Error:", err);
    res.status(500).json({ message: "Server error fetching profile" });
  }
});

// ---------- JWT Authentication Middleware ----------
export function authenticateToken(req, res, next) {
  const authHeader = req.header("Authorization");
  const token = authHeader?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access denied, no token provided" });
  }

  try {
    if (!process.env.JWT_SECRET) {
         console.error("!!! FATAL: JWT_SECRET environment variable not set!"); // Keep
         return res.status(500).json({ message: "Internal server error: JWT configuration missing." });
    }
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    console.error("!!! authenticateToken: JWT Verification Error:", err.name, err.message); // Keep
    const message = err.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid token';
    return res.status(403).json({ message: message });
  }
}

export default router;