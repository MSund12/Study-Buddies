import express from 'express';
import Group from '../models/Group.js';

const router = express.Router();

// ➤ Create Group Endpoint
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

//  Get All Groups with Sorting, Search, and Pagination
router.get('/', async (req, res) => {
  const { sortOrder = 'asc', search = '', page = 1, limit = 10 } = req.query;

  try {
    const query = search
      ? { 
          $or: [
            { groupName: { $regex: search, $options: 'i' } }, // Search by group name
            { course: { $regex: search, $options: 'i' } }     // Search by course code
          ]
        }
      : {};

    const sortOption = sortOrder === 'asc' ? 1 : -1;

    const groups = await Group.find(query)
      .sort({ course: sortOption })          // Sorting logic
      .skip((page - 1) * limit)              // Pagination logic
      .limit(parseInt(limit));               // Limit for pagination

    const totalGroups = await Group.countDocuments(query);  // For total count of matched groups

    res.status(200).json({
      totalGroups,
      totalPages: Math.ceil(totalGroups / limit),
      currentPage: parseInt(page),
      groups
    });
  } catch (error) {
    console.error('Error fetching groups:', error);
    res.status(500).json({ message: 'Failed to fetch groups' });
  }
});

// ➤ Get a Single Group by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const group = await Group.findById(id);

    if (!group) {
      return res.status(404).json({ message: 'Group not found.' });
    }

    res.status(200).json(group);
  } catch (error) {
    console.error('Error fetching group:', error);
    res.status(500).json({ message: 'Failed to fetch the group.' });
  }
});

// ➤ Delete a Group by ID
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deletedGroup = await Group.findByIdAndDelete(id);

    if (!deletedGroup) {
      return res.status(404).json({ message: 'Group not found.' });
    }

    res.status(200).json({ message: 'Group deleted successfully.' });
  } catch (error) {
    console.error('Error deleting group:', error);
    res.status(500).json({ message: 'Failed to delete the group.' });
  }
});

export default router;
