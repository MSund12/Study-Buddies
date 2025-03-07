import React, { useState } from 'react';

const SchedulePage = () => {
  const [dept, setDept] = useState('');
  const [courseId, setCourseId] = useState('');
  const [term, setTerm] = useState('F'); // Term is either "F" or "W"
  const [courseData, setCourseData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Schedule grid start time: 8:30 AM = 510 minutes from midnight
  const scheduleStartMinutes = 8 * 60 + 30;

  // Fetch course data from the endpoint with dept, courseId, and term as query parameters.
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
        const response = await fetch(`http://localhost:5000/api/courses?dept=${dept}&courseId=${courseId}&term=${term}`);

  
      // Check for 404
      if (response.status === 404) {
        const data = await response.json();
        setError(data.message || 'Course not found.');
        setCourseData(null);
      } else if (!response.ok) {
        throw new Error('Failed to fetch course data');
      } else {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          setCourseData(data[0]);
          setError(null);
        } else {
          setError('Course not found.');
          setCourseData(null);
        }
      }
    } catch (err) {
      console.error(err);
      setError('Error fetching course data.');
      setCourseData(null);
    }
    setLoading(false);
  };
  

  // Mapping from day abbreviations (from the database) to full weekday names.
  const dayMap = {
    M: 'Monday',
    T: 'Tuesday',
    W: 'Wednesday',
    R: 'Thursday',
    F: 'Friday'
  };

  // Prepare meetings for each day.
  let meetingsByDay = {
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: []
  };

  if (courseData && courseData.Hours) {
    courseData.Hours.forEach((meeting) => {
      const dayLetter = meeting.Day;
      const fullDay = dayMap[dayLetter];
      if (fullDay) {
        // Convert the meeting start time ("HH:MM") into minutes since midnight.
        const [hourStr, minuteStr] = meeting.Time.split(':');
        const meetingStartMinutes = parseInt(hourStr, 10) * 60 + parseInt(minuteStr, 10);
        const topOffset = meetingStartMinutes - scheduleStartMinutes;
        const endMinutes = meetingStartMinutes + meeting.Dur;
        const formatTime = (minutes) => {
          const hrs = Math.floor(minutes / 60);
          const mins = minutes % 60;
          return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
        };

        meetingsByDay[fullDay].push({
          ...meeting,
          topOffset,
          endTime: formatTime(endMinutes)
        });
      }
    });
  }

  return (
    <div className="padding-container">
      <div className="header-container">
        <a href="/" className="back-button">&larr; Back</a>
        <h1>Schedule Viewer</h1>
      </div>
      <div className="filter-container">
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Dept"
            value={dept}
            onChange={(e) => setDept(e.target.value)}
          />
          <input
            type="text"
            placeholder="Course ID"
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
          />
          <select value={term} onChange={(e) => setTerm(e.target.value)}>
            <option value="F">F</option>
            <option value="W">W</option>
          </select>
          <button type="submit">Show Schedule</button>
        </form>
      </div>
      {loading && <p>Loading course data...</p>}
      {error && <p className="error-message">{error}</p>}
      {courseData && (
        <div>
          <h2>
            Schedule for {courseData.Dept} {courseData["Course ID"]} - {courseData["Course Name"]} ({courseData.Term})
          </h2>
          <div className="schedule">
            {Object.keys(meetingsByDay).map((dayName) => (
              <div className="day" key={dayName}>
                <div className="date-block">{dayName}</div>
                {meetingsByDay[dayName].map((meeting, index) => (
                  <div
                    key={index}
                    className={`time-block ${getMeetingClass(meeting.Type)}`}
                    style={{
                      top: meeting.topOffset,
                      height: meeting.Dur
                    }}
                  >
                    <p>
                      {meeting.Type} {meeting.Meet ? `(${meeting.Meet})` : ''}
                    </p>
                    <p>
                      {meeting.Time} - {meeting.endTime}
                    </p>
                    <p>
                      {meeting.Campus} {meeting.Room && `Room: ${meeting.Room}`}
                    </p>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Helper function to choose a CSS class based on the meeting type.
function getMeetingClass(type) {
  if (type.includes('LECT')) {
    return 'lecture';
  } else if (type.includes('LAB')) {
    return 'lab';
  } else if (type.includes('TUT')) {
    return 'seminar';
  }
  return '';
}

export default SchedulePage;