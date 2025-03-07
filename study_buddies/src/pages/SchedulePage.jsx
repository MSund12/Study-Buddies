import React, { useState } from 'react';



const timeStrToMinutes = (timeStr) => {
  const [hrs, mins] = timeStr.split(':').map(Number);
  return hrs * 60 + mins;
};


const convertType = (type) => {
  if (type === "LECT") return "Lecture";
  if (type === "LAB") return "Lab";
  if (type === "TUTR") return "Tutorial";
  return type;
};

const SchedulePage = () => {
  
  const [dept, setDept] = useState("");
  const [courseId, setCourseId] = useState("");
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

 
  const handleFilter = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      
      const response = await fetch(`/api/courses?dept=${dept}&courseId=${courseId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch courses.");
      }
      const data = await response.json();
      setCourses(data);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  // Schedule settings.
  const scheduleStart = 480; // 8:00 AM in minutes.
  const days = ["M", "T", "W", "R", "F"]; // Monday to Friday

  return (
    <div className="padding-container">
      {}
      <div className="header-container">
        <a href="/" className="back-button">&#8592;</a>
        <h1>Course Schedule</h1>
      </div>

      {/* Filter form */}
      <div className="filter-container">
        <form onSubmit={handleFilter}>
          <input
            type="text"
            placeholder="Dept"
            value={dept}
            onChange={e => setDept(e.target.value)}
          />
          <input
            type="text"
            placeholder="Course ID"
            value={courseId}
            onChange={e => setCourseId(e.target.value)}
          />
          <button type="submit">Search</button>
        </form>
      </div>

      {/* Loader, error notification, or schedule view */}
      {loading && <div>Loading...</div>}
      {error && <div>Error: {error}</div>}

      {courses.length > 0 && (
        <div className="schedule">
          {days.map((day, dayIndex) => {
            // For this day, collect all meeting blocks from all filtered courses
            const meetingBlocks = courses.flatMap((course) =>
              course.Hours.filter((meeting) => meeting.Day === day)
                .map((meeting, idx) => {
                  // Convert meeting start time into minutes
                  const startMinutes = timeStrToMinutes(meeting.Time);
                  const top = startMinutes - scheduleStart;
                  // Determine CSS class based on meeting type
                  let blockClass = "";
                  if (meeting.Type === "LECT") blockClass = "lecture";
                  else if (meeting.Type === "LAB") blockClass = "lab";
                  else if (meeting.Type === "TUTR") blockClass = "seminar"; 

                  // Only display duration and type
                  return (
                    <div
                      key={`${course["Course ID"]}-${meeting.Type}-${idx}`}
                      className={`time-block ${blockClass}`}
                      style={{
                        top: `${top}px`,
                        height: `${meeting.Dur}px`
                      }}
                    >
                      <p>{`${convertType(meeting.Type)} - ${meeting.Dur} min`}</p>
                    </div>
                  );
                })
            );

            return (
              <div key={dayIndex} className="day">
                <div className="date-block">{day}</div>
                {meetingBlocks}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SchedulePage;