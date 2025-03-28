import express from 'express';
import router from express.Router();
import Booking from'../models/Booking';


const OPERATING_HOURS = {
  open: { hour: 8, minute: 30 },
  close: { hour: 16, minute: 30 }
};
const MAX_DAILY_HOURS = 2;

const setTime = (date, hour, minute) => {
  const newDate = new Date(date);
  newDate.setHours(hour, minute, 0, 0);
  return newDate;
};

router.post('/bookings', async (req, res) => {
  try {
    const { start, end } = req.body;
    const userId = req.user && req.user.id ? req.user.id : req.body.userId;
    if (!userId) {
      return res.status(400).json({ message: 'User not provided.' });
    }

    const startTime = new Date(start);
    const endTime = new Date(end);

    if (endTime <= startTime) {
      return res.status(400).json({ message: 'End time must be after start time.' });
    }
    const bookingDuration = (endTime - startTime) / (1000 * 60 * 60); // in hours
    if (bookingDuration > MAX_DAILY_HOURS) {
      return res.status(400).json({ message: 'Cannot book more than 2 hours in a single booking.' });
    }


    const day = startTime.getDay();
    if (day === 0 || day === 6) {
      return res.status(400).json({ message: 'Bookings are allowed Mondays to Fridays only.' });
    }

    const openTime = setTime(startTime, OPERATING_HOURS.open.hour, OPERATING_HOURS.open.minute);
    const closeTime = setTime(startTime, OPERATING_HOURS.close.hour, OPERATING_HOURS.close.minute);

    if (startTime < openTime || endTime > closeTime) {
      return res.status(400).json({ 
        message: `Bookings must be between ${
          OPERATING_HOURS.open.hour + ':' + (OPERATING_HOURS.open.minute < 10 ? '0' : '') + OPERATING_HOURS.open.minute
        } and ${
          OPERATING_HOURS.close.hour + ':' + (OPERATING_HOURS.close.minute < 10 ? '0' : '') + OPERATING_HOURS.close.minute
        }.` 
      });
    }

    const overlap = await Booking.findOne({

      start: { $lt: endTime },
      end: { $gt: startTime }
    });
    if (overlap) {
      return res.status(400).json({ message: 'This time slot is already booked.' });
    }

    const startOfDay = new Date(startTime);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(startTime);
    endOfDay.setHours(23, 59, 59, 999);

    const userBookings = await Booking.find({
      user: userId,
      start: { $gte: startOfDay, $lte: endOfDay }
    });


    let cumulativeHours = bookingDuration;
    userBookings.forEach(booking => {
      cumulativeHours += (booking.end - booking.start) / (1000 * 60 * 60);
    });
    if (cumulativeHours > MAX_DAILY_HOURS) {
      return res.status(400).json({ message: 'You can only book a total of 2 hours per day.' });
    }

    const newBooking = new Booking({
      user: userId,
      start: startTime,
      end: endTime,
    });
    await newBooking.save();

    return res.status(201).json(newBooking);
    
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error occurred.' });
  }
});

module.exports = router;