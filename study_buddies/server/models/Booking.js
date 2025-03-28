import mongoose from "mongoose";

const BookingSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  start: { 
    type: Date, 
    required: true 
  },
  end: { 
    type: Date, 
    required: true 
  },
 
  room: {
    type: String,
    default: 'room1'
  }
}, { timestamps: true });

// An index on start and end can speed up conflict queries
BookingSchema.index({ start: 1, end: 1 });

module.exports = mongoose.model('Booking', BookingSchema);
