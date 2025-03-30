import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js"; // Assuming this path is correct
import TempUser from "../models/TempUser.js"; // Assuming this path is correct

const router = express.Router();

// Generate JWT Token Function
const generateToken = (res, userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
  // Note: Cookies are not typically read by fetch unless credentials are included
  // Frontend might rely on storing token from response body instead.
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // should be true in production (HTTPS)
    sameSite: "strict", // Consider 'Lax' if needed, 'strict' is more secure
    maxAge: 60 * 60 * 1000, // 1 hour
  });
  return token;
};

// Helper Function: Generate a 6-digit verification code
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// ---------- Registration Route (Using TempUser) ----------
router.post("/register", async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    // Check if user already exists in the permanent collection
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "User already exists" });

    // Also check if a registration is pending in the temporary collection
    let tempUser = await TempUser.findOne({ email });
    if (tempUser) {
      return res.status(400).json({
        message:
          "A registration is already pending. Please check your email for the verification code.",
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
      CodeExpiry: codeExpiry,
    });
    await tempUser.save();

    // !! IMPORTANT: Send email with verificationCode here in a real app !!
    console.log(`Verification code for ${email}: ${verificationCode}`); // Log for testing

    res.status(201).json({
      message:
        "User registration initiated! A verification code has been sent to your email (check console for testing).",
      // In production, remove the code from the response/log
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

    // Check that the provided code matches the stored verification code
    if (tempUser.VerifCode !== verificationCode) {
      return res.status(400).json({ message: "Invalid verification code." });
    }

    // Check that the code has not expired
    if (tempUser.CodeExpiry < Date.now()) {
      // Optionally delete expired temp user here
      await TempUser.deleteOne({ email });
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

    // Create the permanent user and mark as verified
    const newUser = new User({
      firstName: tempUser.firstName,
      lastName: tempUser.lastName,
      email: tempUser.email,
      password: tempUser.password, // Use the hashed password from temp user
      isVerified: true,
    });
    await newUser.save();

    // Remove the temporary registration record
    await TempUser.deleteOne({ email });

    // Generate JWT Token for the verified user (optional after verification, user usually logs in next)
    // const token = generateToken(res, newUser._id); // Or skip token generation here

    res.status(201).json({
      message: "User verified successfully. Please proceed to login.",
      // token, // Only include token if you want immediate login
      user: {
        // Return minimal user info confirming verification
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
        message:
          "User not found or not verified. Please sign up and verify your account.",
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
        id: user._id, // Ensure frontend uses 'id'
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
// This middleware verifies the token sent (usually in the Authorization header)
function authenticateToken(req, res, next) {
  // Prefer Authorization header
  let token = req.header("Authorization")?.split(" ")[1];

  // Fallback to checking cookies if no header (adjust if needed)
  if (!token) {
    token = req.cookies?.token;
  }

  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied, no token provided" });
  }

  try {
    // Verify the token
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    // Add the verified user payload (which contains userId) to the request object
    req.user = verified; // req.user will contain { userId: '...', iat: ..., exp: ... }
    next(); // Proceed to the next middleware or route handler
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ message: "Token expired, please log in again" });
    }
    return res.status(403).json({ message: "Invalid or malformed token" });
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
    // Return data in the format frontend expects (map _id to id if needed)
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

// ---------- NEW: User Search Route ----------
// Added authenticateToken middleware to ensure only logged-in users can search
router.get("/search", authenticateToken, async (req, res) => {
  const searchQuery = req.query.query || "";
  const currentUserId = req.user.userId; // Get current user's ID from authenticated token

  if (!searchQuery.trim()) {
    return res.json([]); // Return empty array if search query is empty
  }

  try {
    // Create a case-insensitive regex for searching
    const queryRegex = new RegExp(searchQuery, "i");

    // Find users matching first name or last name, excluding the current user
    const users = await User.find({
      _id: { $ne: currentUserId }, // Exclude the user performing the search
      isVerified: true, // Only search verified users
      $or: [
        // Match first OR last name
        { firstName: queryRegex },
        { lastName: queryRegex },
        // Add { email: queryRegex } here if you want to search emails too
      ],
    })
      .select("_id firstName lastName") // Select only necessary fields
      .limit(10); // Limit the number of results

    // Map the results to the format expected by the frontend { id, name }
    const results = users.map((user) => ({
      id: user._id.toString(), // Ensure ID is a string
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
// ---------- End NEW User Search Route ----------

export default router;
