// routes/bookingRoutes.js
const express = require('express');
const router = express.Router();
const Booking = require('../models/bookings'); // Adjust path if needed
import { authenticateToken } from './userRoutes.js';

// --- Helper Function to get start and end of a given date ---
// Important for daily limit check. Assumes server's local timezone for simplicity.
// Using date-fns would make this more robust across timezones.
const getDayBounds = (date) => {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0); // Set to beginning of the day

    const end = new Date(date);
    end.setHours(23, 59, 59, 999); // Set to end of the day
    return { startOfDay: start, endOfDay: end };
};


// --- Route to Create a New Booking ---
router.post('/', authenticateToken, async (req, res) => {
    const { roomName, startTime, endTime } = req.body;
    // ***** CHANGE THIS LINE *****
    // const userId = req.user.id; // OLD - Incorrect based on your authenticateToken
    const userId = req.user.userId; // NEW - Correct based on your authenticateToken
    // ***** END CHANGE *****

    if (!userId) {
        // This check might catch the issue if the middleware failed silently
        console.error("User ID not found after auth middleware in booking route.");
        return res.status(401).json({ message: 'Authentication failed: User ID missing.' });
    }

    // ... rest of your booking logic remains the same ...
     if (!startTime || !endTime) {
         return res.status(400).json({ message: 'Start time and end time are required.' });
     }
     const start = new Date(startTime);
     const end = new Date(endTime);
    // ... etc ...

     try {
        // Use the correctly extracted userId here for checks and saving
        const { startOfDay, endOfDay } = getDayBounds(start);

        const userBookingsToday = await Booking.find({
            user: userId, // Ensure this uses the correct userId variable
            startTime: { $gte: startOfDay, $lt: endOfDay }
        });
        // ... rest of overlap checks and booking creation using userId ...

         const newBooking = new Booking({
             user: userId, // Ensure this uses the correct userId variable
             roomName: roomName || 'StudyRoomA',
             startTime: start,
             endTime: end,
         });

        await newBooking.save();
        res.status(201).json(newBooking);

     } catch (error) {
       // ... error handling ...
     }
});

// --- Route to Get User's Bookings ---
// Also apply the change here if needed
router.get('/my-bookings', authenticateToken, async (req, res) => {
    try {
        // ***** CHANGE THIS LINE *****
        // const userId = req.user.id; // OLD
        const userId = req.user.userId; // NEW
        // ***** END CHANGE *****

        if (!userId) {
             console.error("User ID not found after auth middleware in my-bookings route.");
            return res.status(401).json({ message: 'Authentication failed: User ID missing.' });
        }

        const bookings = await Booking.find({ user: userId }).sort({ startTime: 1 });
        res.json(bookings);
    } catch (error) {
        console.error("Error fetching user bookings:", error);
        res.status(500).json({ message: 'Server error fetching bookings.' });
    }
});

// --- Route to Get All Bookings (optional, for displaying availability) ---
// Consider filtering by date range for performance
router.get('/', async (req, res) => {
     try {
        // Example: Allow filtering by date ?date=YYYY-MM-DD
        let query = {};
        if (req.query.date) {
            const date = new Date(req.query.date);
             if (!isNaN(date.getTime())) {
                const { startOfDay, endOfDay } = getDayBounds(date);
                query.startTime = { $gte: startOfDay, $lt: endOfDay };
            } else {
                 return res.status(400).json({ message: 'Invalid date format for query. Use YYYY-MM-DD.' });
            }
        }

        const bookings = await Booking.find(query).populate('user', 'name email'); // Populate user details if needed
        res.json(bookings);
    } catch (error) {
        console.error("Error fetching all bookings:", error);
        res.status(500).json({ message: 'Server error fetching bookings.' });
    }
});


module.exports = router;