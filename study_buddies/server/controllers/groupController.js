import Group from "../models/Group.js";

export const createGroup = async (req, res) => {
  try {
    const { name } = req.body;
    const group = await Group.create({
      name,
      course: req.params.courseId,
      members: [req.user.id],
    });
    res.status(201).json(group);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getGroupDetails = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate("members", "name email")
      .populate("course", "code name");
    res.json(group);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteGroup = async (req, res) => {
  try {
    await Group.findByIdAndDelete(req.params.id);
    res.json({ message: "Group deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
