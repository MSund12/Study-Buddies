import React, { useState } from "react";

const BookingPage = () => {
  // Local state for form values and messages.
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    // Ensure the date and times are provided
    if (!date || !startTime || !endTime) {
      setMessage("Please fill in all fields.");
      return;
    }

    // Combine the selected date and time strings to produce ISO datetime strings.
    const startDateTime = new Date(`${date}T${startTime}`);
    const endDateTime = new Date(`${date}T${endTime}`);

    // Quick client-side validation
    if (endDateTime <= startDateTime) {
      setMessage("End time must be after start time.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Add authorization headers here if authentication is required.
        },
        // The backend expects the booking start and end times.
        body: JSON.stringify({
          start: startDateTime,
          end: endDateTime,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // If the server returns an error, display it to the user.
        setMessage(data.message || "Booking failed.");
      } else {
        setMessage("Booking confirmed!");
        // Reset the form after a successful booking.
        setDate("");
        setStartTime("");
        setEndTime("");
      }
    } catch (error) {
      console.error("Error booking room:", error);
      setMessage("Server error. Please try again later.");
    }
    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <h1>Room Booking</h1>
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.field}>
          <label htmlFor="date" style={styles.label}>Date:</label>
          <input
            type="date"
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            style={styles.input}
          />
        </div>
        <div style={styles.field}>
          <label htmlFor="startTime" style={styles.label}>Start Time:</label>
          <input
            type="time"
            id="startTime"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
            style={styles.input}
          />
        </div>
        <div style={styles.field}>
          <label htmlFor="endTime" style={styles.label}>End Time:</label>
          <input
            type="time"
            id="endTime"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            required
            style={styles.input}
          />
        </div>
        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? "Booking..." : "Book Room"}
        </button>
      </form>
      {message && <p style={styles.message}>{message}</p>}
    </div>
  );
};

// Inline styles for quick prototyping. Feel free to replace with your CSS framework.
const styles = {
  container: {
    maxWidth: "400px",
    margin: "2rem auto",
    padding: "1rem",
    border: "1px solid #ccc",
    borderRadius: "8px",
    textAlign: "center",
    fontFamily: "Arial, sans-serif",
  },
  form: {
    display: "flex",
    flexDirection: "column",
  },
  field: {
    marginBottom: "1rem",
    textAlign: "left",
  },
  label: {
    display: "block",
    marginBottom: "0.5rem",
  },
  input: {
    width: "100%",
    padding: "0.5rem",
    fontSize: "1rem",
  },
  button: {
    padding: "0.75rem",
    fontSize: "1rem",
    cursor: "pointer",
  },
  message: {
    marginTop: "1rem",
    fontWeight: "bold",
  },
};

export default BookingPage;
