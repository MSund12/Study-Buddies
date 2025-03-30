// routes/bookingRoutes.js
import express from 'express';
import Booking from '../models/bookings.js';
import { authenticateToken } from './userRoutes.js'; 

const router = express.Router();

// --- Helper Function to get start and end of a given date ---
// (Keep this helper function as it was)
// routes/bookingRoutes.js (Revised getDayBounds)

const getDayBounds = (dateString) => {
    // Expect input like 'YYYY-MM-DD' from req.query.date
    try {
        // Create Date object representing midnight UTC at the start of the target day
        // Appending 'T00:00:00.000Z' forces interpretation as UTC midnight
        const startOfDayUTC = new Date(`${dateString}T00:00:00.000Z`);

        // Check if the resulting date is valid
        if (isNaN(startOfDayUTC.getTime())) {
             console.error("Invalid date string resulted in invalid Date object:", dateString);
             return null; // Indicate error: invalid date input
        }

        // Create Date object for the start of the *next* day in UTC
        const startOfNextDayUTC = new Date(startOfDayUTC);
        startOfNextDayUTC.setUTCDate(startOfDayUTC.getUTCDate() + 1); // Add 1 day (UTC-safe)

        // Return the boundaries
        return { startOfDay: startOfDayUTC, endOfDay: startOfNextDayUTC };
    } catch (e) {
         // Catch potential errors during date manipulation
         console.error("Error processing date string in getDayBounds:", dateString, e);
         return null; // Indicate error
    }
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

router.get('/', async (req, res) => {
    console.log(`>>> GET /api/bookings route hit. Query:`, req.query);
    try {
        let query = {}; // Mongoose query object
        let bounds = null; // Initialize bounds

        // Check if a date query parameter exists and is a non-empty string
        if (req.query.date && typeof req.query.date === 'string' && req.query.date.trim() !== '') {
            // Use the revised getDayBounds with the date string
            bounds = getDayBounds(req.query.date);

            if (bounds) {
                // Use the UTC start/end times for the query
                // Find bookings STARTING >= UTC midnight of target day AND < UTC midnight of NEXT day
                query.startTime = { $gte: bounds.startOfDay, $lt: bounds.endOfDay };
                console.log(`[${new Date().toISOString()}] Querying UTC range: ${bounds.startOfDay.toISOString()} to ${bounds.endOfDay.toISOString()}`);
            } else {
                // getDayBounds returned null due to invalid date format
                console.warn(`[<span class="math-inline">\{new Date\(\)\.toISOString\(\)\}\] Invalid date format received\: '</span>{req.query.date}'. Cannot filter by date.`);
                // Return 400 for invalid date format request
                return res.status(400).json({ message: "Invalid date format. Use YYYY-MM-DD." });
            }
        } else {
             console.log(`[${new Date().toISOString()}] No date query provided. Fetching all bookings (consider adding default filters).`);
             // WARNING: Fetching ALL bookings might be too much data. Add default filters if needed.
             // Example: query.startTime = { $gte: new Date() }; // Only future bookings
        }

        // Execute the query using the defined 'query' object
        const bookings = await Booking.find(query)
                                      .populate('user', 'firstName lastName email')
                                      .sort({ startTime: 1 });

        console.log(`[${new Date().toISOString()}] Found ${bookings.length} bookings matching query.`);

        // Send the found bookings (will be an empty array if none found)
        res.status(200).json(bookings);

    } catch (error) {
        console.error(`[${new Date().toISOString()}] !!! ERROR in GET /api/bookings:`, error);
        res.status(500).json({ message: "Server error fetching bookings." });
    }
});

// Use ESM export default
export default router;