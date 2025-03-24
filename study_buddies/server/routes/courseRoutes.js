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

// 🔎 SEARCH COURSE ROUTE
// GET /api/courses/search?query=<query>
// Search for courses by Dept, Course ID, or Course Name
router.get('/search', async (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ message: 'Search query is required.' });
  }

  try {
    // Split query into potential Dept and Course ID (e.g., "EECS 2032")
    const queryParts = query.trim().split(' ');
    const deptQuery = queryParts[0]?.toUpperCase();
    const courseIdQuery = queryParts[1];

    // Search logic to match different formats
    const courses = await Course.find({
      $or: [
        { Dept: { $regex: deptQuery, $options: 'i' } },                // Matches Dept (e.g., EECS)
        { "Course ID": { $regex: courseIdQuery || query, $options: 'i' } }, // Matches Course ID (e.g., 2032)
        { "Course Name": { $regex: query, $options: 'i' } }            // Matches Course Name
      ]
    }).limit(10); // Limit results for better performance

    if (courses.length === 0) {
      return res.status(404).json({ message: 'No matching courses found.' });
    }

    res.status(200).json(courses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ message: 'Failed to fetch courses.' });
  }
});

// 🟠 EXISTING GET ROUTE: Filter by specific Dept, Course ID, and Term
// GET /api/courses?dept=<dept>&courseId=<courseId>&term=<term>
router.get('/', async (req, res) => {
  const { dept, courseId, term } = req.query;

  if (!dept || !courseId || !term) {
    return res.status(400).json({ message: "Missing required parameters: dept, courseId, or term." });
  }

  const filter = {
    Dept: dept.toUpperCase(),
    "Course ID": courseId,
    Term: term.toUpperCase(),
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

// 🟠 EXISTING POST ROUTE: Add a new course (Protected)
router.post('/add', authenticateToken, async (req, res) => {
  try {
    if (!req.body.Dept || !req.body["Course ID"] || !req.body.Term) {
      return res.status(400).json({ message: "Missing required fields: Dept, Course ID, or Term." });
    }

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
