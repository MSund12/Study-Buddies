import express from 'express';
import jwt from 'jsonwebtoken';
import Course from '../models/Course.js';

const router = express.Router();

// Middleware to authenticate JWT Token (same as in userRoutes)
function authenticateToken(req, res, next) {
  const authHeader = req.header("Authorization");
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Access denied, no token provided" });
  }
  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    res.status(403).json({ message: "Invalid token" });
  }
}

// GET /api/courses?dept=<dept>&courseId=<courseId>&term=<term>
// Returns a list of courses matching the filter parameters.
router.get('/', async (req, res) => {
  const { dept, courseId, term } = req.query;

  // Ensure all required parameters are provided
  if (!dept || !courseId || !term) {
    return res.status(400).json({ message: "Missing required parameters: dept, courseId, or term." });
  }

  // Construct filter object
  const filter = {
    Dept: dept.toUpperCase(), // Ensure case consistency
    "Course ID": courseId,
    Term: term.toUpperCase(), // Ensure case consistency (F or W)
  };

  try {
    const courses = await Course.find(filter);
    if (courses.length === 0) {
      return res.status(404).json({ message: "No courses found with the given parameters." });
    }
    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: "Server error: " + err.message });
  }
});

// POST /api/courses/add
// Protected route to add a new course. Requires a valid token.
router.post('/add', authenticateToken, async (req, res) => {
  try {
    // Validate required fields
    if (!req.body.Dept || !req.body["Course ID"] || !req.body.Term) {
      return res.status(400).json({ message: "Missing required fields: Dept, Course ID, or Term." });
    }

    // Ensure case consistency
    req.body.Dept = req.body.Dept.toUpperCase();
    req.body.Term = req.body.Term.toUpperCase();

    const newCourse = new Course(req.body);
    await newCourse.save();
    
    res.status(201).json({
      message: "Course added successfully",
      course: newCourse,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error: " + err.message });
  }
});

export default router;