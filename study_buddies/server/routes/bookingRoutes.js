// routes/bookingRoutes.js
import express from 'express';
import Booking from '../models/bookings.js'; // Use ESM import and add .js extension
import { authenticateToken } from './userRoutes.js'; // Use ESM import and add .js extension

const router = express.Router();

// --- Helper Function to get start and end of a given date ---
// (Keep this helper function as it was)
const getDayBounds = (date) => {
    // Ensure input is a Date object
    const validDate = date instanceof Date ? date : new Date(date);
    if (isNaN(validDate.getTime())) {
        // Handle invalid date input if necessary, maybe return null or throw error
        console.error("Invalid date passed to getDayBounds:", date);
        // Returning bounds for 'now' might be unsafe, adjust as needed
        const now = new Date();
        const start = new Date(now);
        start.setHours(0, 0, 0, 0);
        const end = new Date(now);
        end.setHours(23, 59, 59, 999);
        return { startOfDay: start, endOfDay: end };
    }

    const start = new Date(validDate);
    start.setHours(0, 0, 0, 0); // Set to beginning of the day

    const end = new Date(validDate);
    end.setHours(23, 59, 59, 999); // Set to end of the day
    return { startOfDay: start, endOfDay: end };
};


// --- Route to Create a New Booking ---
// Uses authenticateToken middleware, accesses req.user.userId
router.post('/', authenticateToken, async (req, res) => {
    const { roomName, startTime, endTime } = req.body;
    const userId = req.user?.userId; // Use optional chaining for safety

    if (!userId) {
        console.error("User ID not found after auth middleware in POST /bookings route.");
        return res.status(401).json({ message: 'Authentication failed: User ID missing.' });
    }

    if (!startTime || !endTime) {
        return res.status(400).json({ message: 'Start time and end time are required.' });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
         return res.status(400).json({ message: 'Invalid date format for start or end time.' });
    }

    try {
        // --- Check 1: User's total booking time for the day ---
        const { startOfDay, endOfDay } = getDayBounds(start);

        const userBookingsToday = await Booking.find({
            user: userId,
            startTime: { $gte: startOfDay, $lt: endOfDay }
        });

        const existingDuration = userBookingsToday.reduce((total, booking) => total + (booking.durationMinutes || (new Date(booking.endTime).getTime() - new Date(booking.startTime).getTime()) / 60000), 0);
        const newDuration = (end.getTime() - start.getTime()) / (1000 * 60);

        if (existingDuration + newDuration > 120) {
             return res.status(400).json({ message: 'Booking exceeds maximum 2 hours allowed per day.' });
        }

        // --- Check 2: Overlap with existing bookings ---
        const overlappingBookings = await Booking.find({
            roomName: roomName || 'StudyRoomA',
            $or: [
                { startTime: { $lt: end }, endTime: { $gt: start } },
            ]
        });

        if (overlappingBookings.length > 0) {
             return res.status(409).json({ message: 'Requested time slot is already booked or overlaps.' });
        }

        // --- Create and Save (Validation included in Model) ---
        const newBooking = new Booking({
            user: userId,
            roomName: roomName || 'StudyRoomA',
            startTime: start,
            endTime: end,
            // durationMinutes should be calculated by model pre-save hook if defined there
        });

        await newBooking.save();
        res.status(201).json(newBooking);

    } catch (error) {
        console.error("Error creating booking:", error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ message: messages.join('. ') || 'Booking validation failed.' });
        }
        res.status(500).json({ message: 'Server error while creating booking.' });
    }
});

// --- Route to Get User's Bookings ---
// Uses authenticateToken middleware, accesses req.user.userId
router.get('/my-bookings', authenticateToken, async (req, res) => {
    const userId = req.user?.userId; // Use optional chaining

    if (!userId) {
         console.error("User ID not found after auth middleware in GET /my-bookings route.");
        return res.status(401).json({ message: 'Authentication failed: User ID missing.' });
    }

    try {
        const bookings = await Booking.find({ user: userId }).sort({ startTime: 1 });
        res.status(200).json(bookings);
    } catch (error) {
        console.error("Error fetching user bookings:", error);
        res.status(500).json({ message: 'Server error fetching bookings.' });
    }
});

// --- Route to Get All Bookings (or Filtered by Date) ---
// Keeping the SIMPLIFIED version for now to confirm routing works first.
// You can replace this with your full logic later.
router.get('/', (req, res) => {
    console.log('>>> GET /api/bookings route hit successfully! (ESM Version)'); // Log confirmation
    // To test actual data fetching later, replace the line below with:
    // try {
    //    let query = {};
    //    if (req.query.date) {
    //       const date = new Date(req.query.date);
    //       if (!isNaN(date.getTime())) {
    //           const { startOfDay, endOfDay } = getDayBounds(date);
    //           query.startTime = { $gte: startOfDay, $lt: endOfDay };
    //       } else {
    //         // Optional: return bad request if date format is invalid
    //         // return res.status(400).json({ message: "Invalid date format."});
    //       }
    //    }
    //    const bookings = await Booking.find(query);
    //    res.status(200).json(bookings);
    // } catch (error) {
    //    console.error("Error fetching all bookings:", error);
    //    res.status(500).json({ message: "Server error fetching bookings." });
    // }

    // Simplified response for initial testing:
    res.status(200).json([{ tempId: 1, message: 'Simplified route reached OK (ESM)' }]);
});

// Use ESM export default
export default router;