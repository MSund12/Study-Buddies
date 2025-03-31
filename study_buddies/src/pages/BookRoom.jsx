// src/pages/BookRoom.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../features/authSlice';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import RedShape from './components/RedShape';
import PinkShape from './components/PinkShape';
import PurpleShape from './components/PurpleShape';
import Header from '../Header';
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
import './styles/BookRoom.css'; // Ensure this CSS file exists




// --- Configuration ---
const API_BASE_URL = 'http://localhost:5000/api'; // Keep corrected Port
const ROOM_NAME = 'StudyRoomA';
const MIN_BOOKING_HOUR = 8;
const MIN_BOOKING_MINUTE = 30;
const MAX_BOOKING_HOUR = 17;
const TIME_SLOT_INTERVAL = 30;

// --- Durations ---
const DURATIONS = [
    { label: '30 minutes', value: 30 },
    { label: '1 hour', value: 60 },
    { label: '1.5 hours', value: 90 },
    { label: '2 hours', value: 120 },
];

const BookRoom = () => {
    // --- State ---
    const [selectedDate, setSelectedDate] = useState(startOfDay(new Date()));
    const [selectedStartTime, setSelectedStartTime] = useState(null);
    const [selectedDuration, setSelectedDuration] = useState(DURATIONS[0].value);
    const [availableSlots, setAvailableSlots] = useState([]);
    const [allBookingsForDay, setAllBookingsForDay] = useState([]);
    const [myBookings, setMyBookings] = useState([]);
    const [loadingBookings, setLoadingBookings] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const navigate = useNavigate(); // Get the navigate function
    const dispatch = useDispatch();

    // --- Redux State ---
    const currentUser = useSelector((state) => state.auth.currentUser);
    const token = useSelector((state) => state.auth.token);

    // --- Memoized Values ---
    const bookingEndTimeLimit = useMemo(() => {
        const date = selectedDate || new Date();
        return setMinutes(setHours(startOfDay(date), MAX_BOOKING_HOUR), 0);
    }, [selectedDate]);

    const bookingStartTimeLimit = useMemo(() => {
        const date = selectedDate || new Date();
        return setMinutes(setHours(startOfDay(date), MIN_BOOKING_HOUR), MIN_BOOKING_MINUTE);
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
            const existingStart = new Date(booking.startTime);
            const existingEnd = new Date(booking.endTime);
            if (!isValid(existingStart) || !isValid(existingEnd)) continue;
            if (isBefore(potentialStart, existingEnd) && isAfter(potentialEnd, existingStart)) {
                return true;
            }
        }
        return false;
    }, []);

    // --- Fetching Logic ---
    // Keep console.error in fetch functions for real errors
    const fetchAllBookingsForDay = useCallback(async (date) => {
        if (!date || !isValid(date)) return;
        setLoadingBookings(true);
        setError('');
        try {
            const dateString = format(date, 'yyyy-MM-dd');
            const response = await axios.get(`${API_BASE_URL}/bookings?date=${dateString}`);
            setAllBookingsForDay(Array.isArray(response.data) ? response.data : []);
        } catch (err) {
            console.error("Error fetching daily bookings:", err); // Keep this error log
            if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
                setError('Connection failed. Ensure the backend server is running on port 5000.');
            } else {
               setError('Failed to load booking availability for the selected date.');
            }
            setAllBookingsForDay([]);
        } finally {
            setLoadingBookings(false);
        }
    }, []);

    const fetchMyBookings = useCallback(async () => {
        if (!token) return;
        try {
             const response = await axios.get(`${API_BASE_URL}/bookings/my-bookings`, {
                headers: { Authorization: `Bearer ${token}` }
            });
             setMyBookings(Array.isArray(response.data) ? response.data : []);
        } catch (err) {
            console.error("Error fetching user bookings:", err); // Keep this error log
            if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
                setError(prev => prev || 'Connection failed. Ensure the backend server is running on port 5000.');
            } else if (err.response?.status === 401 || err.response?.status === 403) {
                 setError(prev => prev || 'Authentication error fetching your bookings. Please try logging in again.');
            }
            setMyBookings([]);
        }
    }, [token]);

    // --- Effects ---
    useEffect(() => {
        fetchAllBookingsForDay(selectedDate);
    }, [selectedDate, fetchAllBookingsForDay]);

    useEffect(() => {
        fetchMyBookings();
    }, [fetchMyBookings]);

    // Calculate available start time slots
     useEffect(() => {
         const potentialSlots = [];
         let currentTime = bookingStartTimeLimit;
         if (!isValid(currentTime)) {
             setAvailableSlots([]); return;
         }
         while (isBefore(currentTime, bookingEndTimeLimit)) {
             potentialSlots.push(new Date(currentTime));
             currentTime = addMinutes(currentTime, TIME_SLOT_INTERVAL);
             if (!isValid(currentTime)) break;
         }
         const validSlots = potentialSlots.filter(slot => {
             const potentialStartTime = combineDateAndTime(selectedDate, slot);
             if (!potentialStartTime) return false;
             const potentialEndTime = addMinutes(potentialStartTime, selectedDuration);
             if (!isValid(potentialEndTime)) return false;
             if (isAfter(potentialEndTime, bookingEndTimeLimit)) return false;
             if (isSlotOverlapping(potentialStartTime, potentialEndTime, allBookingsForDay)) return false;
             return true;
         });
         setAvailableSlots(validSlots);
         if (selectedStartTime) {
             const currentSelectionStillValid = validSlots.some(slot => {
                 const combined = combineDateAndTime(selectedDate, slot);
                 return combined && isValid(combined) && isEqual(combined, selectedStartTime);
             });
             if (!currentSelectionStillValid) setSelectedStartTime(null);
         }
     }, [selectedDate, selectedDuration, allBookingsForDay, bookingStartTimeLimit, bookingEndTimeLimit, combineDateAndTime, isSlotOverlapping, selectedStartTime]);


    // --- Event Handlers ---
    const handleDateChange = (date) => {
        if (isValid(date)) {
            setSelectedDate(startOfDay(date));
            setSelectedStartTime(null);
            setError('');
            setSuccessMessage('');
        }
    };

    const handleStartTimeChange = (event) => {
        const timeString = event.target.value;
        if (timeString) {
            const parsedTime = parse(timeString, 'HH:mm', new Date());
             if (isValid(parsedTime)) {
                 const matchingSlot = availableSlots.find(slot =>
                     getHours(slot) === getHours(parsedTime) && getMinutes(slot) === getMinutes(parsedTime)
                 );
                 if (matchingSlot) setSelectedStartTime(combineDateAndTime(selectedDate, matchingSlot));
                 else setSelectedStartTime(null);
             } else setSelectedStartTime(null);
        } else setSelectedStartTime(null);
    };

    const handleDurationChange = (event) => {
        setSelectedDuration(parseInt(event.target.value, 10));
    };

    // Cleaned handleSubmit function
    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setSuccessMessage('');

        // Essential check kept
        if (!currentUser || !token) {
            setError('You must be logged in to book.');
            return;
        }

        // Optional robustness checks (kept for now, remove if preferred)
        if (!selectedStartTime || !isValid(selectedStartTime)) {
             setError('Internal Error: Invalid start time selected. Please re-select.');
             return;
        }
        if (typeof selectedDuration !== 'number' || selectedDuration <= 0) {
             setError('Internal Error: Invalid duration selected.');
             return;
        }

        let finalEndTime;
        try {
            // Calculation kept
            finalEndTime = addMinutes(selectedStartTime, selectedDuration);
             if (!isValid(finalEndTime)){
                  setError('Internal Error: Calculated end time is invalid.');
                  return;
             }
        } catch(dateError) {
             // Log actual errors during calculation
             console.error('Error calculating finalEndTime:', dateError);
             setError('Internal Error: Failed to calculate end time.');
             return;
        }

        setIsSubmitting(true);

        try {
             // Check dates again right before conversion (kept for robustness)
             if (!isValid(selectedStartTime) || !isValid(finalEndTime)) {
                 setError('Internal Error: Date became invalid before sending.');
                 setIsSubmitting(false); // Reset submitting state
                 return;
             }
             // Payload construction kept
             const payload = {
                 roomName: ROOM_NAME,
                 startTime: selectedStartTime.toISOString(),
                 endTime: finalEndTime.toISOString(),
             };

             // API call kept
             const response = await axios.post(`${API_BASE_URL}/bookings`, payload, {
                 headers: { Authorization: `Bearer ${token}` }
             });

            // Success handling kept
            setSuccessMessage(`Room booked: ${format(selectedStartTime, 'p')} - ${format(finalEndTime, 'p')}`);
            setSelectedStartTime(null); // Reset form

            // Refreshing data kept
            await fetchAllBookingsForDay(selectedDate);
            await fetchMyBookings();

        } catch (err) {
            // Essential error logging for API call failure kept
            console.error('Booking submission failed:', err.response?.data || err.message, err);
            setError(err.response?.data?.message || 'Booking failed during API call.');
        } finally {
             // Final state update kept
             setIsSubmitting(false);
        }
    };

    // --- Date Picker Filter ---
    const isWeekday = (date) => {
        const day = getDay(date);
        return day !== 0 && day !== 6;
    };

    // Handle logout (remains the same)
      const handleSignOut = () => {
        dispatch(logout());
        navigate('/signin');
      };

    // --- Render Logic ---
    // JSX remains the same
    return (
        <div className="starter-container">
            <Header currentUser={currentUser} />

            {/* Sign Out Button */}
                  {currentUser && (
                    <div className="signout-container">
                      <button className="signout-button" onClick={handleSignOut}>
                        Sign Out
                      </button>
                    </div>
                  )}
            
                  {/* Decorative Shapes */}
                  <RedShape color="#1EE1A8" />
                  <PinkShape />
                  <PurpleShape />
            
                  {/* Navigation Buttons */}
                  <nav className="buttons-container-home">
                     <a href="#" className="buttons" onClick={(e) => { e.preventDefault(); navigate('/group-finder'); }}>Study Groups</a>
                     <a href="#" className="buttons" onClick={(e) => { e.preventDefault(); navigate('/chat'); }}>Chats</a>
                     <a href="#" className="buttons" onClick={(e) => { e.preventDefault(); navigate('/schedule'); }}>Schedules</a>
                     <a href="#" className="buttons" onClick={(e) => { e.preventDefault(); navigate('/book'); }}>Book a Room</a>
                  </nav>

            <div className="boom-room-container">
            <p>Select a date, time, and duration (Mon-Fri, 8:30 AM - 5:00 PM, max 2 hours/day).</p>

            <div className="message-area">
                {error && <p className="error-message">{error}</p>}
                {successMessage && <p className="success-message">{successMessage}</p>}
            </div>

            <form onSubmit={handleSubmit} className="booking-form">
                {/* Date Picker */}
                <div className="form-group date-picker-group">
                     <label>Select Date:</label>
                     <DatePicker
                         selected={selectedDate}
                         onChange={handleDateChange}
                         filterDate={isWeekday}
                         minDate={new Date()}
                         dateFormat="PPP"
                         inline
                     />
                 </div>
                {/* Controls: Duration, Time, Button */}
                 <div className="form-controls">
                     {/* Duration Select */}
                     <div className="form-group">
                         <label htmlFor="duration-select">Duration:</label>
                         <select id="duration-select" value={selectedDuration} onChange={handleDurationChange} disabled={isSubmitting}>
                             {DURATIONS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                         </select>
                     </div>
                     {/* Start Time Select */}
                     <div className="form-group">
                         <label htmlFor="start-time-select">Start Time:</label>
                         <select id="start-time-select" value={selectedStartTime ? format(selectedStartTime, 'HH:mm') : ""} onChange={handleStartTimeChange} disabled={isSubmitting || loadingBookings || availableSlots.length === 0} required>
                             <option value="">-- Select Available Time --</option>
                             {loadingBookings ? <option disabled>Loading times...</option> :
                              availableSlots.length === 0 ? <option disabled>No available slots</option> :
                              availableSlots.map(slot => <option key={format(slot, 'HH:mm')} value={format(slot, 'HH:mm')}>{format(slot, 'p')}</option>)}
                         </select>
                         {selectedStartTime && isValid(selectedStartTime) && <p className="info-text">Ends at: {format(addMinutes(selectedStartTime, selectedDuration), 'p')}</p>}
                     </div>
                     {/* Submit Button */}
                     <button type="submit" disabled={isSubmitting || !selectedStartTime || loadingBookings} className="book-button">
                         {isSubmitting ? 'Booking...' : 'Confirm Booking'}
                     </button>
                 </div>
            </form>

            {/* Display Sections */}
            <div className="display-sections">
                {/* Daily Availability */}
                 <div className="availability-info">
                     <h3>Bookings for {isValid(selectedDate) ? format(selectedDate, 'PPP') : 'Invalid Date'}</h3>
                     {loadingBookings ? <p>Loading...</p> :
                         allBookingsForDay.length > 0 ? (
                             <ul>{allBookingsForDay.filter(b => isValid(new Date(b.startTime)) && isValid(new Date(b.endTime))).map(b => <li key={b._id}>Booked: {format(new Date(b.startTime), 'p')} - {format(new Date(b.endTime), 'p')}</li>)}</ul>
                         ) : <p>No bookings found for this date.</p>}
                 </div>
                {/* User's Bookings */}
                 {currentUser && (
                      <div className="my-bookings-list">
                         <h3>My Bookings</h3>
                          {myBookings.length > 0 ? (
                             <ul>{myBookings.filter(b => isValid(new Date(b.startTime)) && isValid(new Date(b.endTime))).map(b => <li key={b._id}>{format(new Date(b.startTime), 'PPP')}: {format(new Date(b.startTime), 'p')} - {format(new Date(b.endTime), 'p')} ({b.roomName})</li>)}</ul>
                         ) : <p>You have no bookings.</p>}
                     </div>
                 )}
            </div>
            </div>
        </div>
    );
};

export default BookRoom;