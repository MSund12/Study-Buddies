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

    // Check if user already exists in the permanent collection
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "User already exists" });

    // Also check if a registration is pending in the temporary collection
    let tempUser = await TempUser.findOne({ email });
    if (tempUser) {
      return res.status(400).json({ 
        message: "A registration is already pending. Please check your email for the verification code." 
      });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate a verification code and its expiration (1 hour)
    const verificationCode = generateVerificationCode();
    const codeExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

    // Create new temporary user record
    tempUser = new TempUser({ 
      firstName, 
      lastName, 
      email, 
      password: hashedPassword, 
      VerifCode: verificationCode,
      CodeExpiry: codeExpiry
    });
    await tempUser.save();

    // TODO: Integrate your email service to send the verification code to the user

    res.status(201).json({
      message: "User registered successfully! A verification code has been sent to your email."
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ---------- Verification Route ----------
router.post('/verify', async (req, res) => {
  try {
    const { email, verificationCode } = req.body;
    
    // Find the temporary user record
    const tempUser = await TempUser.findOne({ email });
    if (!tempUser) {
      return res.status(400).json({ message: "No pending registration for this email." });
    }

    // Check that the provided code matches the stored verification code
    if (tempUser.VerifCode !== verificationCode) {
      return res.status(400).json({ message: "Invalid verification code." });
    }
    
    // Check that the code has not expired
    if (tempUser.CodeExpiry < Date.now()) {
      return res.status(400).json({ message: "Verification code expired. Please register again." });
    }

    // Create the permanent user and mark as verified
    const newUser = new User({
      firstName: tempUser.firstName,
      lastName: tempUser.lastName,
      email: tempUser.email,
      password: tempUser.password,
      isVerified: true,
    });
    await newUser.save();

    // Remove the temporary registration record
    await TempUser.deleteOne({ email });

    // Generate JWT Token for the verified user
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
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ---------- User Login Route ----------
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Only allow login for verified users in the permanent collection
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found or not verified. Please sign up and verify your account." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    // Generate JWT Token
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
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ---------- Protected Route Example (Requires Token) ----------
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ---------- JWT Authentication Middleware ----------
function authenticateToken(req, res, next) {
  const token = req.header("Authorization")?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Access denied, no token provided" });

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid token" });
  }
}

export default router;
