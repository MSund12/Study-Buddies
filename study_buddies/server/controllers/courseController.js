import Course from "../models/Course.js";
import Group from "../models/Group.js";

export const createCourse = async (req, res) => {
  try {
    const { code, name, description } = req.body;
    const course = await Course.create({
      code,
      name,
      description,
      createdBy: req.user.id,
    });
    res.status(201).json(course);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const joinCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);

    // Prevent duplicate enrollment
    if (course.students.includes(req.user.id)) {
      return res.status(400).json({ message: "Already enrolled in course" });
    }

    course.students.push(req.user.id);
    await course.save();
    res.json(course);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getCourses = async (req, res) => {
  try {
    const courses = await Course.find()
      .skip(req.pagination.skip)
      .limit(req.pagination.limit);

    res.json({
      data: courses,
      pagination: req.pagination,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const handleGroupRequest = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { userId, action } = req.body;

    const group = await Group.findById(groupId).populate("members", "_id");

    // Fixed ID comparison using .equals()
    if (!group.members.some((m) => m._id.equals(req.user.id))) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (action === "approve") {
      group.members.push(userId);
    }

    group.requests = group.requests.filter((id) => id.toString() !== userId);
    await group.save();

    res.json(group);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
