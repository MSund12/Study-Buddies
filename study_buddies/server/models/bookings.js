// models/bookings.js
const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Assuming your User model is named 'User'
    required: true,
  },
  roomName: { // You might want a Room model later, but keeping it simple for now
    type: String,
    required: true,
    default: 'StudyRoomA', // Example default room
  },
  startTime: {
    type: Date,
    required: true,
  },
  endTime: {
    type: Date,
    required: true,
  },
  // Optional: Store duration in minutes for easier querying/validation
  durationMinutes: {
    type: Number,
    required: true,
  }
}, { timestamps: true }); // Adds createdAt and updatedAt automatically

// Optional: Index for faster querying based on time and room
bookingSchema.index({ roomName: 1, startTime: 1, endTime: 1 });

// --- Validation Logic (can be placed here or in the controller) ---

// Custom validation function to check booking rules
bookingSchema.pre('validate', function(next) {
  if (!this.startTime || !this.endTime) {
    return next(new Error('Start time and end time are required.'));
  }

  // 1. Check if startTime is before endTime
  if (this.startTime >= this.endTime) {
    return next(new Error('Booking end time must be after start time.'));
  }

  // 2. Calculate duration
  const durationMillis = this.endTime.getTime() - this.startTime.getTime();
  const durationMinutes = durationMillis / (1000 * 60);
  this.durationMinutes = durationMinutes; // Store duration

  // 3. Check max duration (2 hours = 120 minutes)
  if (durationMinutes > 120) {
    return next(new Error('Booking duration cannot exceed 2 hours.'));
  }

  // 4. Check day of the week (Monday=1 to Friday=5)
  const dayOfWeek = this.startTime.getDay(); // Sunday = 0, Monday = 1, ..., Saturday = 6
  if (dayOfWeek < 1 || dayOfWeek > 5) {
    return next(new Error('Bookings are only allowed Monday to Friday.'));
  }

  // 5. Check time of day (8:30 AM to 5:00 PM)
  // Note: getHours/getMinutes use local time based on server's timezone.
  // Consider using UTC or a library like date-fns for robust timezone handling.
  const startHour = this.startTime.getHours();
  const startMinute = this.startTime.getMinutes();
  const endHour = this.endTime.getHours();
  const endMinute = this.endTime.getMinutes();

  const bookingStartMinutes = startHour * 60 + startMinute;
  const bookingEndMinutes = endHour * 60 + endMinute;

  const earliestAllowedMinutes = 8 * 60 + 30; // 8:30 AM
  const latestAllowedMinutes = 17 * 60;      // 5:00 PM

  if (bookingStartMinutes < earliestAllowedMinutes ||
      bookingEndMinutes > latestAllowedMinutes ||
      // Also check if end time wraps past midnight relative to 5 PM
      (endHour === 17 && endMinute > 0) ||
      endHour > 17 ) {
     return next(new Error('Bookings must be between 8:30 AM and 5:00 PM.'));
  }

  next(); // Validation passed so far
});

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;