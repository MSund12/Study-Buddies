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

    console.log("Group Created:", newGroup);

    res.status(201).json({
      message: 'Group created successfully!',
      group: newGroup
    });
  } catch (error) {
    console.error('Error creating group:', error);
    res.status(500).json({ message: 'Failed to create group' });
  }
});

//  Get All Groups with Sorting, Search, and Pagination
router.get('/', async (req, res) => { // Assuming no auth for now
  // ***** ADD THIS LOG AT THE VERY TOP *****
  console.log(`--- GET /api/groups --- Received req.query:`, JSON.stringify(req.query, null, 2));
  // ***** END ADDED LOG *****

  // Destructure query parameters AFTER logging the raw query object
  const { sortOrder = 'asc', search = '', course = '', page = 1, limit = 10 } = req.query;

  try {
    let query = {}; // Initialize empty query object

    // --- Filtering Logic ---
    // This block is likely NOT being entered currently
    if (course) {
      const escapedCourse = escapeRegex(course.trim());
      query = { course: { $regex: new RegExp('^' + escapedCourse + '$', 'i') } };
      console.log(`Filtering by specific course (case-insensitive): "${course}"`); // You probably won't see this
    } else if (search) {
      // ... broad search logic ...
      console.log(`Searching broadly for: "${search}"`);
    } else {
      // This block IS likely being entered
      console.log(`No course or search filters applied. Query remains {}.`); // Added log here
    }
    // --- End Filtering Logic ---

    // Log the final query object being used
    console.log("Executing Group.find with query:", JSON.stringify(query));

    // ... Sorting/Pagination/DB Query ...
    const groups = await Group.find(query) /* ... */ ;
    console.log(`Found ${groups.length} groups matching query.`);
    res.status(200).json({ /* ... response ... */ });

  } catch (error) { /* ... error handling ... */ }
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