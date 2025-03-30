// models/bookings.js
import mongoose from 'mongoose'; // Use import syntax

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Assuming your User model is named 'User' and uses ESM export default
    required: true,
  },
  roomName: {
    type: String,
    required: true,
    default: 'StudyRoomA',
  },
  startTime: {
    type: Date,
    required: true,
  },
  endTime: {
    type: Date,
    required: true,
  },
  durationMinutes: {
    type: Number,
    required: true,
  }
}, { timestamps: true });

bookingSchema.index({ roomName: 1, startTime: 1, endTime: 1 });

// --- Validation Logic ---
// Keep the pre-validate hook as is
bookingSchema.pre('validate', function(next) {
  if (!this.startTime || !this.endTime) {
    return next(new Error('Start time and end time are required.'));
  }
  if (this.startTime >= this.endTime) {
    return next(new Error('Booking end time must be after start time.'));
  }

  const durationMillis = this.endTime.getTime() - this.startTime.getTime();
  const durationMinutes = durationMillis / (1000 * 60);
  this.durationMinutes = durationMinutes; // Set the duration

  // Check if durationMinutes was calculated successfully before validating it
  if (typeof this.durationMinutes !== 'number' || isNaN(this.durationMinutes)) {
     // Should not happen if startTime/endTime are valid Dates, but good failsafe
     return next(new Error('Could not calculate booking duration.'));
  }

  if (this.durationMinutes > 120) {
    return next(new Error('Booking duration cannot exceed 2 hours.'));
  }

  const dayOfWeek = this.startTime.getDay();
  if (dayOfWeek < 1 || dayOfWeek > 5) {
    return next(new Error('Bookings are only allowed Monday to Friday.'));
  }

  const startHour = this.startTime.getHours();
  const startMinute = this.startTime.getMinutes();
  const endHour = this.endTime.getHours();
  const endMinute = this.endTime.getMinutes();

  const bookingStartMinutes = startHour * 60 + startMinute;
  const bookingEndMinutes = endHour * 60 + endMinute;
  const earliestAllowedMinutes = 8 * 60 + 30;
  const latestAllowedMinutes = 17 * 60;

  if (bookingStartMinutes < earliestAllowedMinutes ||
      bookingEndMinutes > latestAllowedMinutes ||
      (endHour === 17 && endMinute > 0) ||
      endHour > 17 ) {
     return next(new Error('Bookings must be between 8:30 AM and 5:00 PM.'));
  }

  next();
});

const Booking = mongoose.model('Booking', bookingSchema);

// Use ES Module export default syntax
export default Booking;