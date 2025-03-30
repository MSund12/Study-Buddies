// src/pages/BookRoom.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import {
    format,
    setHours,
    setMinutes,
    setSeconds,
    setMilliseconds,
    getDay,
    addMinutes,
    getMinutes,
    getHours,
    isBefore,
    isAfter,
    isEqual,
    parse,
    startOfDay,
    isValid,
} from 'date-fns';

import 'react-datepicker/dist/react-datepicker.css';
import './styles/BookRoom.css'; // Updated CSS import path for consistency
import Header from '../Header'; // Adjust path as needed

// --- Configuration ---
const API_BASE_URL = 'http://localhost:5000/api'; // Replace with your actual API base URL
const ROOM_NAME = 'StudyRoomA'; // Default room or make selectable
const MIN_BOOKING_HOUR = 8;
const MIN_BOOKING_MINUTE = 30;
const MAX_BOOKING_HOUR = 17; // Bookings must END by 5:00 PM (17:00)
const TIME_SLOT_INTERVAL = 30; // Generate potential start times every 30 mins

// --- Durations ---
const DURATIONS = [
    { label: '30 minutes', value: 30 },
    { label: '1 hour', value: 60 },
    { label: '1.5 hours', value: 90 },
    { label: '2 hours', value: 120 },
];

// Changed component name to BookRoom
const BookRoom = () => {
    // --- State ---
    const [selectedDate, setSelectedDate] = useState(startOfDay(new Date())); // Default to today, start of day
    const [selectedStartTime, setSelectedStartTime] = useState(null); // Stores the chosen start time Date object
    const [selectedDuration, setSelectedDuration] = useState(DURATIONS[0].value); // Default duration
    const [availableSlots, setAvailableSlots] = useState([]); // Filtered, valid start time slots (Date objects)
    const [allBookingsForDay, setAllBookingsForDay] = useState([]); // Bookings made by anyone on the selected date
    const [myBookings, setMyBookings] = useState([]); // Logged-in user's bookings
    const [loadingBookings, setLoadingBookings] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // --- Redux State ---
    const currentUser = useSelector((state) => state.auth.currentUser);
    const token = useSelector((state) => state.auth.token); // Adjust based on your store structure

    // --- Memoized Values ---
    const bookingEndTimeLimit = useMemo(() => {
        const date = selectedDate || new Date();
        return setMinutes(setHours(startOfDay(date), MAX_BOOKING_HOUR), 0); // 5:00 PM on selected date
    }, [selectedDate]);

    const bookingStartTimeLimit = useMemo(() => {
        const date = selectedDate || new Date();
        return setMinutes(setHours(startOfDay(date), MIN_BOOKING_HOUR), MIN_BOOKING_MINUTE); // 8:30 AM on selected date
    }, [selectedDate]);

    // --- Helper Functions ---
    const combineDateAndTime = useCallback((datePart, timePart) => {
        if (!datePart || !timePart || !isValid(datePart) || !isValid(timePart)) {
            return null;
        }
        return setSeconds(setMilliseconds(
            setMinutes(setHours(startOfDay(datePart), getHours(timePart)), getMinutes(timePart)),
            0), 0);
    }, []);

    const isSlotOverlapping = useCallback((potentialStart, potentialEnd, existingBookings) => {
        for (const booking of existingBookings) {
            // Ensure dates from backend are parsed correctly
            const existingStart = new Date(booking.startTime);
            const existingEnd = new Date(booking.endTime);

            if (!isValid(existingStart) || !isValid(existingEnd)) {
                 console.warn("Invalid booking date encountered:", booking);
                 continue; // Skip invalid booking data
            }

            // Check for overlap: (StartA < EndB) and (EndA > StartB)
            if (isBefore(potentialStart, existingEnd) && isAfter(potentialEnd, existingStart)) {
                return true; // Found overlap
            }
        }
        return false; // No overlap found
    }, []);

    // --- Fetching Logic ---
    const fetchAllBookingsForDay = useCallback(async (date) => {
        if (!date || !isValid(date)) return;
        setLoadingBookings(true);
        setError('');
        try {
            const dateString = format(date, 'yyyy-MM-dd');
            const response = await axios.get(`${API_BASE_URL}/bookings?date=${dateString}`);
            // Ensure response.data is an array before setting
            setAllBookingsForDay(Array.isArray(response.data) ? response.data : []);
        } catch (err) {
            console.error("Error fetching daily bookings:", err);
            setError('Failed to load booking availability for the selected date.');
            setAllBookingsForDay([]); // Clear possibly stale data
        } finally {
            setLoadingBookings(false);
        }
    }, []); // No external dependencies needed here

    const fetchMyBookings = useCallback(async () => {
        if (!token) return;
        try {
            const response = await axios.get(`${API_BASE_URL}/bookings/my-bookings`, {
                headers: { Authorization: `Bearer ${token}` }
            });
             // Ensure response.data is an array
             setMyBookings(Array.isArray(response.data) ? response.data : []);
        } catch (err) {
            console.error("Error fetching user bookings:", err);
            setMyBookings([]); // Clear on error
        }
    }, [token]);

    // --- Effects ---

    // Fetch all bookings when selectedDate changes
    useEffect(() => {
        fetchAllBookingsForDay(selectedDate);
    }, [selectedDate, fetchAllBookingsForDay]);

    // Fetch user's bookings when component mounts or token changes
    useEffect(() => {
        fetchMyBookings();
    }, [fetchMyBookings]); // Dependency array includes the memoized function

    // Calculate available start time slots
    useEffect(() => {
        const potentialSlots = [];
        let currentTime = bookingStartTimeLimit;

        // Ensure currentTime is valid before starting loop
         if (!isValid(currentTime)) {
             console.error("Booking start time limit is invalid");
             setAvailableSlots([]);
             return;
         }

        while (isBefore(currentTime, bookingEndTimeLimit)) {
            potentialSlots.push(new Date(currentTime));
            currentTime = addMinutes(currentTime, TIME_SLOT_INTERVAL);
             // Safety break if date becomes invalid (less likely with date-fns but good practice)
            if (!isValid(currentTime)) break;
        }

        const validSlots = potentialSlots.filter(slot => {
            const potentialStartTime = combineDateAndTime(selectedDate, slot);
            if (!potentialStartTime) return false;

            const potentialEndTime = addMinutes(potentialStartTime, selectedDuration);
            if (!isValid(potentialEndTime)) return false;

            if (isAfter(potentialEndTime, bookingEndTimeLimit)) {
                return false;
            }

            if (isSlotOverlapping(potentialStartTime, potentialEndTime, allBookingsForDay)) {
                return false;
            }

            return true;
        });

        setAvailableSlots(validSlots);

        if (selectedStartTime) {
             const currentSelectionStillValid = validSlots.some(slot => {
                const combined = combineDateAndTime(selectedDate, slot);
                return combined && isValid(combined) && isEqual(combined, selectedStartTime);
             });
             if (!currentSelectionStillValid) {
                 setSelectedStartTime(null);
             }
        }

    }, [selectedDate, selectedDuration, allBookingsForDay, bookingStartTimeLimit, bookingEndTimeLimit, combineDateAndTime, isSlotOverlapping, selectedStartTime]);


    // --- Event Handlers ---
    const handleDateChange = (date) => {
        if (isValid(date)) {
            setSelectedDate(startOfDay(date));
            setSelectedStartTime(null);
            setError('');
            setSuccessMessage('');
        } else {
             console.warn("Invalid date selected");
             // Optionally set an error message for the user
        }
    };

    const handleStartTimeChange = (event) => {
        const timeString = event.target.value;
        if (timeString) {
            // Try parsing the time string HH:mm
            const parsedTime = parse(timeString, 'HH:mm', new Date());
             if (isValid(parsedTime)) {
                // Find the corresponding Date object from availableSlots to ensure it's a valid choice
                 const matchingSlot = availableSlots.find(slot =>
                     getHours(slot) === getHours(parsedTime) && getMinutes(slot) === getMinutes(parsedTime)
                 );
                 if (matchingSlot) {
                     setSelectedStartTime(combineDateAndTime(selectedDate, matchingSlot));
                 } else {
                     // This case should ideally not happen if dropdown is correctly populated
                     console.warn("Selected time not found in available slots.");
                     setSelectedStartTime(null);
                 }
             } else {
                 setSelectedStartTime(null);
             }
        } else {
            setSelectedStartTime(null);
        }
    };

    const handleDurationChange = (event) => {
        setSelectedDuration(parseInt(event.target.value, 10));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setSuccessMessage('');

        if (!currentUser || !token) {
            setError('You must be logged in to book.');
            return;
        }
        if (!selectedStartTime || !isValid(selectedStartTime)) {
            setError('Please select a valid start time.');
            return;
        }
        if (!selectedDuration) {
             setError('Please select a duration.');
            return;
        }

        const finalEndTime = addMinutes(selectedStartTime, selectedDuration);
        if (!isValid(finalEndTime)){
            setError('Calculated end time is invalid. Please check selection.');
            return;
        }

        if (isAfter(finalEndTime, bookingEndTimeLimit)) {
            setError(`Booking must end by ${format(bookingEndTimeLimit, 'p')}.`);
            return;
        }

        setIsSubmitting(true);
        try {
            // Ensure data sent is valid
            const payload = {
                 roomName: ROOM_NAME,
                 startTime: selectedStartTime.toISOString(),
                 endTime: finalEndTime.toISOString(),
            };

            const response = await axios.post(`${API_BASE_URL}/bookings`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setSuccessMessage(`Room booked: ${format(selectedStartTime, 'PPP p')} - ${format(finalEndTime, 'p')}`);
            setSelectedStartTime(null); // Reset selection

            // Refresh data after successful booking
            // Use await to ensure fetches complete before proceeding if necessary
            await fetchAllBookingsForDay(selectedDate);
            await fetchMyBookings();

        } catch (err) {
            console.error("Booking submission failed:", err.response?.data || err.message);
            setError(err.response?.data?.message || 'Booking failed. Slot may be taken or daily limit exceeded.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- Date Picker Filter ---
    const isWeekday = (date) => {
        const day = getDay(date);
        return day !== 0 && day !== 6; // Exclude Sunday (0) and Saturday (6)
    };

    // --- Render Logic ---
    return (
        // Changed class name for the container
        <div className="book-room-container">
            <Header currentUser={currentUser} />
            <h2>Book a Study Room</h2>
            <p>Select a date, time, and duration (Mon-Fri, 8:30 AM - 5:00 PM, max 2 hours/day).</p>

            {/* Message Area */}
            <div className="message-area">
                {error && <p className="error-message">{error}</p>}
                {successMessage && <p className="success-message">{successMessage}</p>}
            </div>

            <form onSubmit={handleSubmit} className="booking-form">
                <div className="form-group date-picker-group">
                    <label>Select Date:</label>
                    <DatePicker
                        selected={selectedDate}
                        onChange={handleDateChange}
                        filterDate={isWeekday}
                        minDate={new Date()} // Prevent booking past dates
                        dateFormat="PPP" // e.g., "Mar 30th, 2025"
                        inline // Show calendar directly
                    />
                </div>

                <div className="form-controls">
                    <div className="form-group">
                        <label htmlFor="duration-select">Duration:</label>
                        <select
                            id="duration-select"
                            value={selectedDuration}
                            onChange={handleDurationChange}
                            disabled={isSubmitting}
                        >
                            {DURATIONS.map(d => (
                                <option key={d.value} value={d.value}>
                                    {d.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="start-time-select">Start Time:</label>
                        <select
                            id="start-time-select"
                            value={selectedStartTime ? format(selectedStartTime, 'HH:mm') : ""}
                            onChange={handleStartTimeChange}
                            disabled={isSubmitting || loadingBookings || availableSlots.length === 0}
                            required
                        >
                            <option value="">-- Select Available Time --</option>
                            {loadingBookings ? (
                                <option disabled>Loading times...</option>
                            ) : availableSlots.length === 0 ? (
                                 <option disabled>No available slots</option>
                             ) : (
                                availableSlots.map(slot => (
                                    <option key={format(slot, 'HH:mm')} value={format(slot, 'HH:mm')}>
                                        {format(slot, 'p')} {/* e.g., 8:30 AM */}
                                    </option>
                                ))
                            )}
                        </select>
                         {selectedStartTime && isValid(selectedStartTime) && (
                            <p className="info-text">
                                Ends at: {format(addMinutes(selectedStartTime, selectedDuration), 'p')}
                            </p>
                         )}
                    </div>

                    <button type="submit" disabled={isSubmitting || !selectedStartTime || loadingBookings} className="book-button">
                        {isSubmitting ? 'Booking...' : 'Confirm Booking'}
                    </button>
                </div>
            </form>

            <div className="display-sections">
                 {/* Section to display general bookings for the selected day */}
                 <div className="availability-info">
                     <h3>Bookings for {isValid(selectedDate) ? format(selectedDate, 'PPP') : 'Invalid Date'}</h3>
                     {loadingBookings ? <p>Loading...</p> :
                         allBookingsForDay.length > 0 ? (
                             <ul>
                                 {allBookingsForDay
                                    .filter(booking => isValid(new Date(booking.startTime)) && isValid(new Date(booking.endTime))) // Filter out invalid dates before mapping
                                    .map(booking => (
                                     <li key={booking._id}>
                                         Booked: {format(new Date(booking.startTime), 'p')} - {format(new Date(booking.endTime), 'p')}
                                     </li>
                                 ))}
                             </ul>
                         ) : <p>No bookings found for this date.</p>
                     }
                 </div>

                 {/* Section to display user's specific bookings */}
                 {currentUser && (
                      <div className="my-bookings-list">
                         <h3>My Bookings</h3>
                          {myBookings.length > 0 ? (
                             <ul>
                                 {myBookings
                                    .filter(booking => isValid(new Date(booking.startTime)) && isValid(new Date(booking.endTime))) // Filter out invalid dates
                                    .map(booking => (
                                     <li key={booking._id}>
                                         {format(new Date(booking.startTime), 'PPP')}: {format(new Date(booking.startTime), 'p')} - {format(new Date(booking.endTime), 'p')} ({booking.roomName})
                                         {/* Add cancel button/logic here if needed */}
                                     </li>
                                 ))}
                             </ul>
                         ) : <p>You have no bookings.</p>}
                     </div>
                 )}
            </div>
        </div>
    );
};

// Changed default export name
export default BookRoom;