import express from "express";
import {
  createCourse,
  joinCourse,
  getCourses,
  createGroup,
  handleGroupRequest,
} from "../controllers/courseController.js";
import auth from "../middleware/auth.js";
import { validateObjectId } from "../middleware/validateObjectId.js";
import { paginateResults } from "../middleware/pagination.js";
import Course from "../models/Course.js";

const router = express.Router();

router.post("/", auth, createCourse);
router.get(
  "/",
  auth,
  paginateResults(Course), // Pagination middleware
  getCourses
);
router.post("/:courseId/join", auth, validateObjectId("courseId"), joinCourse);
router.post(
  "/:courseId/groups",
  auth,
  validateObjectId("courseId"),
  createGroup
);
router.put(
  "/groups/:groupId/requests",
  auth,
  validateObjectId("groupId"),
  handleGroupRequest
);

export default router;
