// routes/bookingRoutes.js
import express from 'express';
import Booking from '../models/bookings.js';
import { authenticateToken } from './userRoutes.js'; 

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
    console.log(`[${new Date().toISOString()}] --- POST /api/bookings START ---`); // Log entry with timestamp
    const { roomName, startTime, endTime } = req.body;
    const userId = req.user?.userId;
    console.log(`[${new Date().toISOString()}] Received Data:`, { roomName, startTime, endTime, userId }); // Log received data

    if (!userId) {
        console.log(`[${new Date().toISOString()}] Missing userId. Sending 401.`);
        return res.status(401).json({ message: 'Authentication failed: User ID missing.' });
    }
    // ... other initial checks for startTime, endTime ...
    const start = new Date(startTime);
    const end = new Date(endTime);
    console.log(`[${new Date().toISOString()}] Parsed Dates:`, { start, end }); // Log parsed dates
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        console.log(`[${new Date().toISOString()}] Invalid date format. Sending 400.`);
         return res.status(400).json({ message: 'Invalid date format for start or end time.' });
    }

    try {
        console.log(`[${new Date().toISOString()}] Calculating daily limit...`); // Log before DB call 1
        const { startOfDay, endOfDay } = getDayBounds(start);
        const userBookingsToday = await Booking.find({ user: userId, startTime: { $gte: startOfDay, $lt: endOfDay } });
        console.log(`[${new Date().toISOString()}] Found user bookings today: ${userBookingsToday.length}`); // Log after DB call 1

        const existingDuration = userBookingsToday.reduce((total, booking) => total + (booking.durationMinutes || (new Date(booking.endTime).getTime() - new Date(booking.startTime).getTime()) / 60000), 0);
        const newDuration = (end.getTime() - start.getTime()) / (1000 * 60);
        console.log(`[${new Date().toISOString()}] Calculated durations:`, { existingDuration, newDuration }); // Log durations

        if (existingDuration + newDuration > 120) {
            console.log(`[${new Date().toISOString()}] Exceeded daily limit. Sending 400.`); // Log before sending response
            return res.status(400).json({ message: 'Booking exceeds maximum 2 hours allowed per day.' });
        }

        console.log(`[${new Date().toISOString()}] Checking for overlaps...`); // Log before DB call 2
        const overlappingBookings = await Booking.find({ roomName: roomName || 'StudyRoomA', $or: [{ startTime: { $lt: end }, endTime: { $gt: start } }] });
        console.log(`[${new Date().toISOString()}] Found overlapping bookings: ${overlappingBookings.length}`); // Log after DB call 2

        if (overlappingBookings.length > 0) {
            console.log(`[${new Date().toISOString()}] Overlap detected. Sending 409.`); // Log before sending response
            return res.status(409).json({ message: 'Requested time slot is already booked or overlaps.' });
        }

        console.log(`[${new Date().toISOString()}] Creating new booking document...`); // Log before creating instance
        const newBooking = new Booking({ user: userId, roomName: roomName || 'StudyRoomA', startTime: start, endTime: end });

        console.log(`[${new Date().toISOString()}] Attempting to save booking...`); // Log before DB save call
        await newBooking.save(); // The model's pre-validate hook runs here
        console.log(`[${new Date().toISOString()}] Booking saved successfully. Sending 201.`); // Log after successful save

        res.status(201).json(newBooking); // Final success response

    } catch (error) {
        console.error(`[${new Date().toISOString()}] !!! ERROR in POST /api/bookings:`, error); // Log any caught error
        if (!res.headersSent) { // Ensure response isn't sent twice
            if (error.name === 'ValidationError') {
                const messages = Object.values(error.errors).map(val => val.message);
                res.status(400).json({ message: messages.join('. ') || 'Booking validation failed.' });
            } else {
               res.status(500).json({ message: 'Server error while creating booking.' });
            }
        } else {
             console.error(`[${new Date().toISOString()}] Error occurred, but headers already sent.`);
        }
    }
    // This log might not appear if return was hit earlier or response sent successfully
    // console.log(`[${new Date().toISOString()}] --- POST /api/bookings END ---`);
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