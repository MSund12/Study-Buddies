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

// Helper Function: getDayBounds (Ensure this is present from previous steps)
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


// ➤ Create Group Endpoint (Requires Authentication)
router.post('/create', authenticateToken, async (req, res) => {
  const { course, groupName, maxMembers } = req.body;
  const creatorId = req.user?.userId; // Get creator's ID from token

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
    const newGroup = new Group({
        course: course.trim(), // Trim input
        groupName: groupName.trim(), // Trim input
        maxMembers: maxMembersNum,
        members: [creatorId] // Initialize members array with creator
    });

    await newGroup.save();
    console.log(`Group "${groupName}" Created by ${creatorId}`); // Essential operational log

    res.status(201).json({
      message: 'Group created successfully!',
      group: newGroup
    });
  } catch (error) {
    console.error('Error creating group:', error); // Keep essential error log
    // Handle potential duplicate key errors if a unique index exists
    if (error.code === 11000) {
         return res.status(409).json({ message: 'A group with this name or details already exists.' });
    }
    res.status(500).json({ message: 'Failed to create group due to server error.' });
  }
});

// ➤ Get All Groups / Filtered by Course (Currently Unauthenticated - adjust if needed)
router.get('/', async (req, res) => { // Keep unauthenticated or re-add authenticateToken if needed
  console.log(`--- GET /api/groups --- Received req.query:`, JSON.stringify(req.query, null, 2));
  const { sortOrder = 'asc', search = '', course = '', page = 1, limit = 9 } = req.query;
  try {
    let query = {};

    // --- Filtering Logic ---
    if (course) {
      // REMOVED escapeRegex - not needed for simple course names like "MATH 2930"
      const courseName = course.trim();
      if(courseName){
          const courseRegex = new RegExp('^' + courseName + '$', 'i'); // Case-insensitive exact match
          query = { course: courseRegex }; // Use the RegExp object directly
          console.log(`Filtering by specific course (case-insensitive): "${courseName}"`);
      } else {
          query = { _id: null }; console.warn(`Course query invalid: "${course}"`);
      }
    } else if (search) {
       // Keep broad search logic using escapeRegex as group names might have special chars
       const escapedSearch = escapeRegex(search.trim());
       if(escapedSearch){ query = { $or: [ { groupName: { $regex: escapedSearch, $options: 'i' } }, { course: { $regex: escapedSearch, $options: 'i' } } ] }; }
       else { query = { _id: null }; console.warn(`Search query invalid: "${search}"`); }
       console.log(`Searching broadly for: "${search}"`);
    } else {
       console.log(`No course or search filters applied. Query is {}.`);
    }
    // --- End Filtering Logic ---

    // Log the final query object BEFORE stringifying it for accurate view
    console.log("Step A: Executing Group.find with query object:", query);
    // Also log the stringified version for comparison if needed
    // console.log("Step A (Stringified): Executing Group.find with query:", JSON.stringify(query));


    // --- Sorting & Pagination (Keep as is) ---
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
    console.log(`Step B: Found ${groups.length} raw groups matching filter.`); // Updated log message


    // --- Fetch Owner Details (Keep as is) ---
    const ownerIds = [ ...new Set( groups.map(group => group.members?.[0]).filter(id => id) ) ];
    console.log("Step C: Extracted unique ownerIds:", ownerIds);
    let ownerMap = {};
    if (ownerIds.length > 0) {
        console.log("Step D: Attempting User.find for owners...");
        const owners = await User.find({ _id: { $in: ownerIds } }).select('firstName lastName').lean();
        console.log(`Step E: Found ${owners.length} owner documents:`, JSON.stringify(owners));
        ownerMap = owners.reduce((map, user) => {
            map[user._id.toString()] = { firstName: user.firstName, lastName: user.lastName };
            return map;
        }, {});
        console.log("Step F: Created ownerMap with keys:", Object.keys(ownerMap));
    } else {
         console.log("Step D-F: No valid ownerIds found in the fetched groups.");
    }

    // --- Add Owner Info to Groups (Keep as is) ---
    console.log("Step G: Mapping groups to add owner info...");
    const groupsWithOwners = groups.map(group => {
         const ownerId = group.members?.[0];
         const foundOwner = ownerMap[ownerId];
         // Keep log for debugging individual group mapping
         // console.log(` -> Group ${group._id}, Owner ID: ${ownerId}, Found in map: ${!!foundOwner}`);
         return { ...group, owner: foundOwner || null };
    });
    console.log("Step H: Finished mapping groups.");


    const totalGroups = await Group.countDocuments(query);

    console.log("Step I: Sending final response.");
    res.status(200).json({
      totalGroups,
      totalPages: Math.ceil(totalGroups / limitNum),
      currentPage: pageNum,
      groups: groupsWithOwners
    });

  } catch (error) {
    console.error('Error fetching groups with owners:', error);
    res.status(500).json({ message: 'Failed to fetch groups' });
  }
});


// ➤ Get a Single Group by ID (Currently Unauthenticated)
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
      // Consider populating members here too if needed on detail page
      const group = await Group.findById(id); //.populate('members', 'firstName lastName');
      if (!group) {
        return res.status(404).json({ message: 'Group not found.' });
      }
      res.status(200).json(group);
    } catch (error) {
      console.error('Error fetching group by ID:', error);
      // Handle CastError specifically if ID format is invalid
      if (error.name === 'CastError') {
          return res.status(400).json({ message: 'Invalid group ID format.' });
      }
      res.status(500).json({ message: 'Failed to fetch the group.' });
    }
});

// ➤ Delete a Group by ID (Currently Unauthenticated - WARNING)
router.delete('/:id', async (req, res) => { // Consider adding authenticateToken back
  const { id } = req.params;
  // WARNING: Add authorization check here to ensure only creator/admin can delete
  try {
      const deletedGroup = await Group.findByIdAndDelete(id);
      if (!deletedGroup) {
        return res.status(404).json({ message: 'Group not found.' });
      }
      res.status(200).json({ message: 'Group deleted successfully.' });
    } catch (error) {
      console.error('Error deleting group:', error);
      if (error.name === 'CastError') {
          return res.status(400).json({ message: 'Invalid group ID format.' });
      }
      res.status(500).json({ message: 'Failed to delete the group.' });
    }
});

router.post('/create', authenticateToken, async (req, res) => { /* ... includes members: [creatorId] ... */ });
router.get('/:id', async (req, res) => { /* ... */ });
router.delete('/:id', async (req, res) => { /* ... */ });

export default router;