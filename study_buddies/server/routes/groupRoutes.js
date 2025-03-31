// routes/groupRoutes.js
import express from 'express';
import Group from '../models/Group.js';
// Keep authenticateToken import if you intend to re-add auth later, otherwise remove
import { authenticateToken } from './userRoutes.js';

const router = express.Router();

// --- ADD THIS HELPER FUNCTION ---
// Escapes special characters for use in Regular Expressions
function escapeRegex(string) {
  if (typeof string !== 'string') return ''; // Handle non-string input
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}
// --- END HELPER FUNCTION ---


// --- Helper Function: getDayBounds (Ensure this is also present and correct) ---
const getDayBounds = (dateInput) => {
    let targetDate;
    try {
        if (typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateInput.trim())) {
            targetDate = new Date(`${dateInput.trim()}T00:00:00.000Z`);
        } else if (dateInput instanceof Date && !isNaN(dateInput.getTime())) {
            const year = dateInput.getUTCFullYear();
            const month = dateInput.getUTCMonth();
            const day = dateInput.getUTCDate();
            targetDate = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
        } else {
             console.error("Invalid input provided to getDayBounds:", dateInput);
             return null;
        }
        if (isNaN(targetDate.getTime())) {
             console.error("Processed date resulted in invalid Date object:", dateInput);
             return null;
        }
        const startOfNextDayUTC = new Date(targetDate);
        startOfNextDayUTC.setUTCDate(targetDate.getUTCDate() + 1);
        return { startOfDay: targetDate, endOfDay: startOfNextDayUTC };
    } catch (e) {
       console.error("Error processing date input in getDayBounds:", dateInput, e);
       return null;
    }
};


// ➤ Create Group Endpoint (Unauthenticated Version)
router.post('/create', authenticateToken, async (req, res) => { // <-- Added authenticateToken HERE only
  const { course, groupName, maxMembers } = req.body;
  const creatorId = req.user?.userId; // <-- Get creator's ID from middleware

  // Validate input
  if (!course || !groupName || !maxMembers) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  if (!creatorId) {
      return res.status(401).json({ message: 'Authentication error: Creator ID missing.' });
  }
  const maxMembersNum = parseInt(maxMembers);
  if (isNaN(maxMembersNum) || maxMembersNum < 1) {
      return res.status(400).json({ message: 'Max members must be a positive number.' });
  }

  try {
    // Create the new group, initializing members array with the creator's ID
    const newGroup = new Group({
        course,
        groupName,
        maxMembers: maxMembersNum,
        members: [creatorId] // <-- Initialize members array with creator
    });

    await newGroup.save();
    console.log(`Group "${groupName}" Created by ${creatorId}`);

    res.status(201).json({
      message: 'Group created successfully!',
      group: newGroup
    });
  } catch (error) {
    console.error('Error creating group:', error);
    res.status(500).json({ message: 'Failed to create group' });
  }
});

// ➤ Get All Groups / Filtered by Course (Unauthenticated Version)
router.get('/', async (req, res) => { // Removed authenticateToken
  const { sortOrder = 'asc', search = '', course = '', page = 1, limit = 10 } = req.query;
  try {
    let query = {};
    if (course) {
      const escapedCourse = escapeRegex(course.trim()); // Now uses the defined helper
      // Check if escapeRegex returned a non-empty string before creating regex
      if(escapedCourse){
          query = { course: { $regex: new RegExp('^' + escapedCourse + '$', 'i') } };
      } else {
          // Handle case where course name is invalid or only contains special characters?
          // Maybe default to finding nothing or ignore filter. Finding nothing is safer.
          query = { _id: null }; // Query that finds nothing
          console.warn(`Course query resulted in empty string after escape: "${course}"`);
      }
    } else if (search) {
      const escapedSearch = escapeRegex(search.trim());
       if(escapedSearch){
            query = { $or: [ { groupName: { $regex: escapedSearch, $options: 'i' } }, { course: { $regex: escapedSearch, $options: 'i' } } ] };
       } else {
           query = { _id: null }; // Query that finds nothing
           console.warn(`Search query resulted in empty string after escape: "${search}"`);
       }
    } // else query remains {} to fetch all

    const sortOption = sortOrder === 'asc' ? { createdAt: 1 } : { createdAt: -1 };
    const pageNum = parseInt(page) >= 1 ? parseInt(page) : 1;
    const limitNum = parseInt(limit) >= 1 ? parseInt(limit) : 10;
    const skipAmount = (pageNum - 1) * limitNum;

    const groups = await Group.find(query)
      .sort(sortOption)
      .skip(skipAmount)
      .limit(limitNum);
      // Removed populate again as no user context without auth

    const totalGroups = await Group.countDocuments(query);

    res.status(200).json({
      totalGroups,
      totalPages: Math.ceil(totalGroups / limitNum),
      currentPage: pageNum,
      groups
    });
  } catch (error) {
    console.error('Error fetching groups:', error); // Keep essential error log
    res.status(500).json({ message: 'Failed to fetch groups' });
  }
});


// ➤ Get a Single Group by ID (Unauthenticated Version)
router.get('/:id', async (req, res) => { // Removed authenticateToken
  const { id } = req.params;
  try {
      const group = await Group.findById(id);
      if (!group) {
        return res.status(404).json({ message: 'Group not found.' });
      }
      res.status(200).json(group);
    } catch (error) {
      console.error('Error fetching group:', error); // Keep essential error log
      res.status(500).json({ message: 'Failed to fetch the group.' });
    }
});

// ➤ Delete a Group by ID (Unauthenticated Version)
router.delete('/:id', async (req, res) => { // Removed authenticateToken
  const { id } = req.params;
  // WARNING: Still no authorization check!
  try {
      const deletedGroup = await Group.findByIdAndDelete(id);
      if (!deletedGroup) {
        return res.status(404).json({ message: 'Group not found.' });
      }
      res.status(200).json({ message: 'Group deleted successfully.' });
    } catch (error) {
      console.error('Error deleting group:', error); // Keep essential error log
      res.status(500).json({ message: 'Failed to delete the group.' });
    }
});

export default router;