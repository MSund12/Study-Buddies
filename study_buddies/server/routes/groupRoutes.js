// routes/groupRoutes.js
import express from 'express';
import Group from '../models/Group.js';
import User from '../models/User.js'; // Import User model
import { authenticateToken } from './userRoutes.js'; // For protected routes

const router = express.Router();

// Helper function to escape regex special characters
function escapeRegex(string) {
  if (typeof string !== 'string') return '';
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Helper Function: getDayBounds (Ensure this is present and correct)
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
             console.error("Invalid input provided to getDayBounds:", dateInput); // Keep Error Log
             return null;
        }
        if (isNaN(targetDate.getTime())) {
             console.error("Processed date resulted in invalid Date object:", dateInput); // Keep Error Log
             return null;
        }
        const startOfNextDayUTC = new Date(targetDate);
        startOfNextDayUTC.setUTCDate(targetDate.getUTCDate() + 1);
        return { startOfDay: targetDate, endOfDay: startOfNextDayUTC };
    } catch (e) {
       console.error("Error processing date input in getDayBounds:", dateInput, e); // Keep Error Log
       return null;
    }
};

//   GET /api/user/groups/courses
//   Requires:  Authorization header (JWT)
//   Returns:  Array of courses associated with groups created by the user

router.get('/user/groups/courses', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId; //   Get user ID from the JWT

    //   1. Find groups created by the user
    const groups = await Group.find({ members: userId });  // Changed from createdBy to members

    if (!groups || groups.length === 0) {
      return res.status(200).json([]); //   No groups, no courses
    }

    //   2. Extract course information from the groups
    const courseNames = groups.map(group => group.course); //  Groups have a 'course' field
    const uniqueCourseNames = [...new Set(courseNames)]; // Remove duplicates

    //   3. Fetch the full course details (if needed, based on your frontend needs)
    //   If you only need the course names, you can send uniqueCourseNames directly
    const courses = await Course.find({ "Course Name": { $in: uniqueCourseNames } }); //  Adjust field name as needed

    res.status(200).json(courses); // Or res.status(200).json(uniqueCourseNames);
  } catch (error) {
    console.error('Error fetching user-created group courses:', error);
    res.status(500).json({ message: 'Failed to fetch courses.' });
  }
});


// ➤ Create Group Endpoint (Requires Authentication)
router.post('/create', authenticateToken, async (req, res) => {
  const { course, groupName, maxMembers } = req.body;
  const creatorId = req.user?.userId;

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
    const newGroup = new Group({
        course: course.trim(),
        groupName: groupName.trim(),
        maxMembers: maxMembersNum,
        members: [creatorId] // Initialize members array with creator
    });

    await newGroup.save();
    console.log(`Group "${groupName}" Created by ${creatorId}`); // Keep operational log

    res.status(201).json({
      message: 'Group created successfully!',
      group: newGroup
    });
  } catch (error) {
    console.error('Error creating group:', error); // Keep essential error log
    if (error.code === 11000) {
         return res.status(409).json({ message: 'A group with this name or details already exists.' });
    }
    res.status(500).json({ message: 'Failed to create group due to server error.' });
  }
});

// ➤ Get All Groups / Filtered by Course (Currently Unauthenticated)
router.get('/', async (req, res) => {
  const { sortOrder = 'asc', search = '', course = '', page = 1, limit = 9 } = req.query;
  try {
    let query = {};
    // --- Filtering Logic ---
    if (course) {
      const courseName = course.trim();
      if(courseName){
          const courseRegex = new RegExp('^' + courseName + '$', 'i');
          query = { course: courseRegex };
          // Removed filtering log
      } else {
          query = { _id: null }; console.warn(`Course query invalid: "${course}"`); // Keep warning
      }
    } else if (search) {
       const escapedSearch = escapeRegex(search.trim());
       if(escapedSearch){ query = { $or: [ { groupName: { $regex: escapedSearch, $options: 'i' } }, { course: { $regex: escapedSearch, $options: 'i' } } ] }; }
       else { query = { _id: null }; console.warn(`Search query invalid: "${search}"`); } // Keep warning
       // Removed broad search log
    } // else: No filters applied log removed

    // Removed query object log

    // --- Sorting & Pagination ---
    const sortOption = sortOrder === 'asc' ? { groupName: 1 } : { groupName: -1 };
    const pageNum = parseInt(page) >= 1 ? parseInt(page) : 1;
    const limitNum = parseInt(limit) >= 1 ? parseInt(limit) : 9;
    const skipAmount = (pageNum - 1) * limitNum;

    // --- Database Query (Get Groups) ---
    const groups = await Group.find(query)
      .sort(sortOption)
      .skip(skipAmount)
      .limit(limitNum)
      .lean();
    // Removed found X groups log

    // --- Fetch Owner Details ---
    const ownerIds = [ ...new Set( groups.map(group => group.members?.[0]).filter(id => id) ) ];
    let ownerMap = {};
    if (ownerIds.length > 0) {
        const owners = await User.find({ _id: { $in: ownerIds } }).select('firstName lastName').lean();
        ownerMap = owners.reduce((map, user) => {
            map[user._id.toString()] = { firstName: user.firstName, lastName: user.lastName };
            return map;
        }, {});
        // Removed owner fetching/map logs
    } else {
         // Removed no ownerIds log
    }

    // --- Add Owner Info to Groups ---
    const groupsWithOwners = groups.map(group => ({
        ...group,
        owner: ownerMap[group.members?.[0]] || null
    }));
    // Removed mapping logs

    const totalGroups = await Group.countDocuments(query);

    // Removed sending response log
    res.status(200).json({
      totalGroups,
      totalPages: Math.ceil(totalGroups / limitNum),
      currentPage: pageNum,
      groups: groupsWithOwners
    });

  } catch (error) {
    console.error('Error fetching groups:', error); // Keep essential error log
    res.status(500).json({ message: 'Failed to fetch groups' });
  }
});


// ➤ Get a Single Group by ID (Currently Unauthenticated)
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
      const group = await Group.findById(id);
      if (!group) {
        return res.status(404).json({ message: 'Group not found.' });
      }
      res.status(200).json(group);
    } catch (error) {
      console.error('Error fetching group by ID:', error); // Keep essential error log
      if (error.name === 'CastError') {
          return res.status(400).json({ message: 'Invalid group ID format.' });
      }
      res.status(500).json({ message: 'Failed to fetch the group.' });
    }
});

// ➤ Delete a Group by ID (Currently Unauthenticated - WARNING)
router.delete('/:id', async (req, res) => { // Consider adding authenticateToken back
  const { id } = req.params;
  // WARNING: No authorization check!
  try {
      const deletedGroup = await Group.findByIdAndDelete(id);
      if (!deletedGroup) {
        return res.status(404).json({ message: 'Group not found.' });
      }
      res.status(200).json({ message: 'Group deleted successfully.' });
    } catch (error) {
      console.error('Error deleting group:', error); // Keep essential error log
      if (error.name === 'CastError') {
          return res.status(400).json({ message: 'Invalid group ID format.' });
      }
      res.status(500).json({ message: 'Failed to delete the group.' });
    }
});

// Removed duplicated route definitions from the end

export default router;