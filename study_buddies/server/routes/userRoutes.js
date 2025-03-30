// routes/userRoutes.js
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js'; // Assuming paths are correct and models use ESM export
import TempUser from '../models/TempUser.js';

const router = express.Router();

// Generate JWT Token Function
const generateToken = (res, userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
  // Note: Cookies may not be the primary auth method if frontend uses Authorization header.
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // should be true in production (HTTPS)
    sameSite: "strict", // 'strict' is more secure, consider 'Lax' only if necessary
    maxAge: 60 * 60 * 1000, // 1 hour
  });
  return token; // Return token so it can be sent in response body
};

// Helper Function: Generate a 6-digit verification code
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// ---------- Registration Route (Using TempUser) ----------
router.post("/register", async (req, res) => {
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
    const codeExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

    tempUser = new TempUser({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      VerifCode: verificationCode,
      CodeExpiry: codeExpiry,
    });
    await tempUser.save();

    // !! IMPORTANT: Send email with verificationCode here in a real app !!
    console.log(`Verification code for ${email}: ${verificationCode}`); // Log for testing

    res.status(201).json({
      message: "User registration initiated! A verification code should be sent to your email (check console for testing).",
    });
  } catch (err) {
    console.error("Registration Error:", err);
    res.status(500).json({ message: "Server error during registration" });
  }
});

// ---------- Verification Route ----------
router.post("/verify", async (req, res) => {
  try {
    const { email, verificationCode } = req.body;

    // Find the temporary user record
    const tempUser = await TempUser.findOne({ email });
    if (!tempUser) {
      return res.status(400).json({
        message: "No pending registration for this email, or already verified.",
      });
    }

    if (tempUser.VerifCode !== verificationCode) {
      return res.status(400).json({ message: "Invalid verification code." });
    }

    // Check that the code has not expired
    if (tempUser.CodeExpiry < Date.now()) {
      await TempUser.deleteOne({ email }); // Clean up expired temp user
      return res
        .status(400)
        .json({ message: "Verification code expired. Please register again." });
    }

    // Check if user already exists in permanent collection (edge case)
    let existingUser = await User.findOne({ email: tempUser.email });
    if (existingUser) {
      await TempUser.deleteOne({ email }); // Clean up temp user
      return res
        .status(400)
        .json({ message: "User already exists and is verified." });
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

    // Standard flow: Verification successful, user should login next.
    // No token generated here.
    res.status(201).json({
      message: "User verified successfully. Please proceed to login.",
      user: {
        id: newUser._id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
      },
    });
  } catch (err) {
    console.error("Verification Error:", err);
    res.status(500).json({ message: "Server error during verification" });
  }
});

// ---------- User Login Route ----------
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user in the permanent collection
    const user = await User.findOne({ email });

    // Check if user exists and is verified
    if (!user || !user.isVerified) {
      return res.status(400).json({
        message: "User not found or not verified. Please sign up and verify your account.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate JWT Token and set cookie
    const token = generateToken(res, user._id);

    // Send response (including token in body for frontend JS access)
    res.json({
      message: "Login successful",
      token, // Send token in response body
      user: {
        // Send user details needed by frontend
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "Server error during login" });
  }
});

// ---------- JWT Authentication Middleware ----------
// Exported for use in other route files (like bookingRoutes)
export function authenticateToken(req, res, next) {
  // Prioritize Authorization header
  const authHeader = req.header("Authorization");
  const token = authHeader?.split(" ")[1];

  if (!token) {
    // If header fails, you could optionally check req.cookies.token here
    // if your frontend might rely on cookies sometimes, but header is standard for APIs.
    return res
      .status(401)
      .json({ message: "Access denied, no token provided" });
  }

  try {
     // Verify JWT_SECRET is loaded
     if (!process.env.JWT_SECRET) {
         console.error("!!! FATAL: JWT_SECRET environment variable not set!");
         return res.status(500).json({ message: "Internal server error: JWT configuration missing." });
     }
    // Verify the token
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    // Add the verified user payload (which contains userId) to the request object
    req.user = verified; // req.user will contain { userId: '...', iat: ..., exp: ... }
    next(); // Proceed to the next middleware or route handler
  } catch (err) {
     console.error("!!! authenticateToken: JWT Verification Error:", err.name, err.message); // Keep essential error log
     let message = "Invalid token";
     if (err.name === "TokenExpiredError") {
         message = "Token expired, please log in again";
     }
     // Use 401 for expired, 403 for invalid/malformed
     const status = err.name === "TokenExpiredError" ? 401 : 403;
     return res.status(status).json({ message: message });
  }
}

// ---------- Protected Route Example (Requires Token) ----------
// Middleware 'authenticateToken' runs first
router.get("/profile", authenticateToken, async (req, res) => {
  try {
    // req.user.userId is available because authenticateToken middleware added it
    const user = await User.findById(req.user.userId).select("-password"); // Exclude password hash
    if (!user) {
      return res.status(404).json({ message: "User profile not found" });
    }
    // Return data in the format frontend expects
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
    console.error("Profile fetch error:", err);
    res.status(500).json({ message: "Server error fetching profile" });
  }
});

// ---------- User Search Route ----------
// Added authenticateToken middleware
router.get("/search", authenticateToken, async (req, res) => {
  const searchQuery = req.query.query || "";
  const currentUserId = req.user.userId; // Get current user's ID from authenticated token

  if (!searchQuery.trim()) {
    return res.json([]); // Return empty array if search query is empty
  }

  try {
    const queryRegex = new RegExp(searchQuery, "i"); // Case-insensitive search

    const users = await User.find({
      _id: { $ne: currentUserId }, // Exclude the user performing the search
      isVerified: true, // Only search verified users
      $or: [
        { firstName: queryRegex },
        { lastName: queryRegex },
        // { email: queryRegex }, // Uncomment to search emails too
      ],
    })
      .select("_id firstName lastName") // Select only necessary fields
      .limit(10); // Limit results

    const results = users.map((user) => ({
      id: user._id.toString(), // Ensure ID is string
      firstName: user.firstName,
      lastName: user.lastName,
      name: `${user.firstName} ${user.lastName}`, // Combine name for display
    }));

    res.json(results);
  } catch (error) {
    console.error("Error searching users:", error);
    res.status(500).json({ message: "Error searching for users" });
  }
});
// ---------- End User Search Route ----------

export default router; // Keep ESM export default