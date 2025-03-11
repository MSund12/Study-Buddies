import express from 'express';
import Group from '../models/Group.js';  // Import Group schema

const router = express.Router();

// Create Group Endpoint
router.post('/create', async (req, res) => {
  const { course, groupName, maxMembers } = req.body;

  if (!course || !groupName || !maxMembers) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const newGroup = new Group({ course, groupName, maxMembers });

    await newGroup.save();

    res.status(201).json({
      message: 'Group created successfully!',
      group: newGroup
    });
  } catch (error) {
    console.error('Error creating group:', error);
    res.status(500).json({ message: 'Failed to create group. Please try again later.' });
  }
});

// Get All Groups (Optional for viewing all groups)
router.get('/', async (req, res) => {
  try {
    const groups = await Group.find();
    res.status(200).json(groups);
  } catch (error) {
    console.error('Error fetching groups:', error);
    res.status(500).json({ message: 'Failed to fetch groups' });
  }
});

export default router;
