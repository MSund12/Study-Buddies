// routes/bookingRoutes.js
import express from 'express';
import Booking from '../models/bookings.js';
import { authenticateToken } from './userRoutes.js';

const router = express.Router();

// --- Helper Function: getDayBounds (Revised) ---
const getDayBounds = (dateString) => {
    try {
        const startOfDayUTC = new Date(`${dateString}T00:00:00.000Z`);
        if (isNaN(startOfDayUTC.getTime())) {
             console.error("Invalid date string resulted in invalid Date object:", dateString);
             return null;
        }
        const startOfNextDayUTC = new Date(startOfDayUTC);
        startOfNextDayUTC.setUTCDate(startOfDayUTC.getUTCDate() + 1);
        return { startOfDay: startOfDayUTC, endOfDay: startOfNextDayUTC };
    } catch (e) {
       console.error("Error processing date string in getDayBounds:", dateString, e);
       return null;
    }
};

// --- Route to Create a New Booking ---
router.post('/', authenticateToken, async (req, res) => {
    const { roomName, startTime, endTime } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
        return res.status(401).json({ message: 'Authentication failed: User ID missing.' });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
         return res.status(400).json({ message: 'Invalid date format for start or end time.' });
    }

    try {
        // Note: Passing Date object 'start' to getDayBounds which expects a string 'YYYY-MM-DD'.
        // This might work if Date.prototype.toString() gives the right format, but it's safer
        // to format 'start' back to 'YYYY-MM-DD' string if needed by getDayBounds,
        // or adjust getDayBounds to accept Date objects. Assuming current behavior is intended.
        const { startOfDay, endOfDay } = getDayBounds(start);

        const userBookingsToday = await Booking.find({ user: userId, startTime: { $gte: startOfDay, $lt: endOfDay } });

        const existingDuration = userBookingsToday.reduce((total, booking) => total + (booking.durationMinutes || (new Date(booking.endTime).getTime() - new Date(booking.startTime).getTime()) / 60000), 0);
        const newDuration = (end.getTime() - start.getTime()) / (1000 * 60);

        if (existingDuration + newDuration > 120) {
            return res.status(400).json({ message: 'Booking exceeds maximum 2 hours allowed per day.' });
        }

        const overlappingBookings = await Booking.find({ roomName: roomName || 'StudyRoomA', $or: [{ startTime: { $lt: end }, endTime: { $gt: start } }] });

        if (overlappingBookings.length > 0) {
            return res.status(409).json({ message: 'Requested time slot is already booked or overlaps.' });
        }

        const newBooking = new Booking({ user: userId, roomName: roomName || 'StudyRoomA', startTime: start, endTime: end });

        await newBooking.save();

        res.status(201).json(newBooking);

    } catch (error) {
        console.error(`[${new Date().toISOString()}] !!! ERROR in POST /api/bookings:`, error);
        if (!res.headersSent) {
            if (error.message) {
                 if (error.name === 'ValidationError') {
                     const messages = Object.values(error.errors).map(val => val.message);
                     res.status(400).json({ message: messages.join('. ') || 'Booking validation failed.' });
                 } else {
                     // Handle custom errors thrown from pre-validate hooks or other errors with messages
                     res.status(400).json({ message: error.message });
                 }
            } else {
                 // Fallback for unexpected errors
                 res.status(500).json({ message: 'Server error while creating booking.' });
            }
        } else {
             console.error(`[${new Date().toISOString()}] Error occurred, but headers already sent.`);
        }
    }
});

// --- Route to Get User's Bookings ---
router.get('/my-bookings', authenticateToken, async (req, res) => {
    const userId = req.user?.userId;

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
router.get('/', async (req, res) => {
    try {
        let query = {};
        let bounds = null;

        if (req.query.date && typeof req.query.date === 'string' && req.query.date.trim() !== '') {
            bounds = getDayBounds(req.query.date);
            if (bounds) {
                query.startTime = { $gte: bounds.startOfDay, $lt: bounds.endOfDay };
            } else {
                console.warn(`[${new Date().toISOString()}] Invalid date format received: '${req.query.date}'. Cannot filter by date.`);
                return res.status(400).json({ message: "Invalid date format. Use YYYY-MM-DD." });
            }
        } else {
             // No date query provided - default behavior is to fetch all (add filters if needed)
        }

        // Query only if bounds were valid or no date was specified
        // (Prevents querying with empty {} if date was invalid and 400 was returned)
        // This check might be redundant now that invalid date returns 400 above.
        // if (bounds || !req.query.date) { ... }
        const bookings = await Booking.find(query)
                                      .populate('user', 'firstName lastName email')
                                      .sort({ startTime: 1 });

        res.status(200).json(bookings);

    } catch (error) {
        console.error(`[${new Date().toISOString()}] !!! ERROR in GET /api/bookings:`, error);
        res.status(500).json({ message: "Server error fetching bookings." });
    }
});

// Use ESM export default
export default router;