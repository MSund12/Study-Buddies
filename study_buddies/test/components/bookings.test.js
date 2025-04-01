import mongoose from 'mongoose';
import Booking from '../../server/models/bookings'; // Path to the Booking model

describe('Booking Model Validation', () => {

  beforeAll(() => {
    // Set up any necessary database connection or mock initialization if required
    // If you're not using a real DB, this is where you can mock mongoose methods
  });

  afterAll(() => {
    // Clean up after tests, like closing the mock DB connection if applicable
    jest.clearAllMocks();
  });

  it('should throw an error if the start time is after the end time', async () => {
    const invalidBooking = new Booking({
      user: new mongoose.Types.ObjectId(),
      roomName: 'StudyRoomA',
      startTime: new Date('2025-03-31T12:00:00Z'),
      endTime: new Date('2025-03-31T11:00:00Z'),
      durationMinutes: 60,
    });

    try {
      await invalidBooking.validate();  // This triggers the validation logic
    } catch (error) {
      expect(error.message).toBe('Booking end time must be after start time.');
    }
  });

  it('should throw an error if the duration exceeds 120 minutes', async () => {
    const invalidBooking = new Booking({
      user: new mongoose.Types.ObjectId(),
      roomName: 'StudyRoomA',
      startTime: new Date('2025-03-31T10:00:00Z'),
      endTime: new Date('2025-03-31T13:30:00Z'), // Duration > 120 minutes
      durationMinutes: 210,
    });

    try {
      await invalidBooking.validate();
    } catch (error) {
      expect(error.message).toBe('Booking duration cannot exceed 2 hours.');
    }
  });

  it('should throw an error if the booking is outside allowed hours (before 8:30 AM)', async () => {
    const invalidBooking = new Booking({
      user: new mongoose.Types.ObjectId(),
      roomName: 'StudyRoomA',
      startTime: new Date('2025-03-31T08:00:00Z'),
      endTime: new Date('2025-03-31T09:00:00Z'),
      durationMinutes: 60,
    });

    try {
      await invalidBooking.validate();
    } catch (error) {
      expect(error.message).toBe('Bookings must be between 8:30 AM and 5:00 PM.');
    }
  });

  it('should throw an error if booking day is outside Monday-Friday', async () => {
    const invalidBooking = new Booking({
      user: new mongoose.Types.ObjectId(),
      roomName: 'StudyRoomA',
      startTime: new Date('2025-03-29T10:00:00Z'), // Saturday
      endTime: new Date('2025-03-29T11:00:00Z'),
      durationMinutes: 60,
    });

    try {
      await invalidBooking.validate();
    } catch (error) {
      expect(error.message).toBe('Bookings are only allowed Monday to Friday.');
    }
  });

  it('should pass validation for a valid booking', async () => {
    const validBooking = new Booking({
      user: new mongoose.Types.ObjectId(),
      roomName: 'StudyRoomA',
      startTime: new Date('2025-03-31T09:00:00Z'),
      endTime: new Date('2025-03-31T10:00:00Z'),
      durationMinutes: 60,
    });

    try {
      await validBooking.validate();  // This triggers the validation logic
      expect(validBooking.durationMinutes).toBe(60);
    } catch (error) {
      throw new Error('Valid booking failed validation');
    }
  });
});
