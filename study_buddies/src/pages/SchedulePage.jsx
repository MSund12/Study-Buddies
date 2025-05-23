import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCourseData, clearCourseData } from '../features/courseSlice';
import { useNavigate } from 'react-router-dom';
import { logout } from '../features/authSlice';
import RedShape from './components/RedShape';
import PurpleShape from './components/PurpleShape';
import PinkShape from './components/PinkShape';
import Header from '../Header';
import "./styles/SchedulePage.css"

const SchedulePage = () => {
  const currentUser = useSelector((state) => state.auth.currentUser);
  const [dept, setDept] = useState('');
  const [courseId, setCourseId] = useState('');
  const [term, setTerm] = useState('F'); // Term is either "F" or "W"

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { courseData, loading, error } = useSelector((state) => state.courses);

  const scheduleStartMinutes = 8 * 60 + 30;

  const handleSignOut = () => {
          dispatch(logout());
          navigate('/starter');
        };

  // Submit handler to dispatch Redux async thunk
  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(fetchCourseData({ dept, courseId, term }));
  };

  const dayMap = {
    M: 'Monday',
    T: 'Tuesday',
    W: 'Wednesday',
    R: 'Thursday',
    F: 'Friday'
  };

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
      <RedShape color="#58C8D7" />
      <PurpleShape color="#E6487F"/>
      <PinkShape color="#F6960A"/>

      <nav className="buttons-container-home">

        <a
          href="#"
          className="buttons"
          onClick={(e) => {
            e.preventDefault();
            navigate('/group-finder');
          }}
        >
          Study Groups
        </a>

        <a
          href="#"
          className="buttons"
          onClick={(e) => {
            e.preventDefault();
            navigate('/chat');
          }}
        >
          Chats
        </a>

        <a
          href="#"
          className="buttons"
          onClick={(e) => {
            e.preventDefault();
            navigate('/schedule');
          }}
        >
          Schedules
        </a>

        <a 
        href="#" 
        className="buttons"
        onClick={(e) => {e.preventDefault();
            navigate('/book')
        }}
        >Book a Room</a>
      </nav>
        
      <h1 className='title'>Schedule Viewer</h1>
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
          <h2 className='schedule-title'>
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
