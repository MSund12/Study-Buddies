// src/pages/HomePage.jsx
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../features/authSlice';
import { useNavigate } from 'react-router-dom';
import GroupFinderPage from './GroupFinderPage';
import GroupPage from './GroupPage';
import RedShape from './components/RedShape';
import PinkShape from './components/PinkShape';
import PurpleShape from './components/PurpleShape';
import './styles/HomePage.css';
import Header from '../Header';

const API_BASE_URL = 'http://localhost:5000';

const HomePage = () => {
  const [showGroupFinder, setShowGroupFinder] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [courses, setCourses] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [fetchError, setFetchError] = useState('');

  const currentUser = useSelector((state) => state.auth.currentUser);
  const token = useSelector((state) => state.auth.token);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserGroupCourses = async () => {
      setFetchError('');
      if (!currentUser || !token) {
        console.log("User or token not available for fetching courses.");
        // Clear courses if user logs out or token is missing
        setCourses([]);
        return;
      }

      try {
        // --- CORRECTED URL ---
        const apiUrl = `${API_BASE_URL}/api/groups/user/groups/courses`;
        // --- END CORRECTION ---

        const response = await fetch(apiUrl, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          // Handle different errors more specifically if possible
          if (response.status === 404) {
              throw new Error(`API endpoint not found (${response.status}). Check the URL: ${apiUrl}`);
          }
          const errorData = await response.json().catch(() => ({ message: `HTTP error! Status: ${response.status}` }));
          throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        if (Array.isArray(data)) {
            setCourses(data);
        } else {
            console.error('Received non-array data for courses:', data);
            setCourses([]);
            setFetchError('Received invalid course data from server.');
        }

      } catch (error) {
        console.error('Error fetching user group courses:', error);
        setFetchError(error.message || 'Failed to fetch courses. Check network connection or server status.');
        setCourses([]);
      }
    };

    fetchUserGroupCourses();
  }, [currentUser, token]); // Dependencies remain the same

  const handleSignOut = () => {
    dispatch(logout());
    navigate('/signin');
  };

  const handleCourseClick = (courseTitle) => {
    if (!courseTitle) return;
    const courseSlug = courseTitle.trim().toLowerCase().replace(/\s+/g, '-');
    const path = `/courses/${courseSlug}`;
    console.log(`Navigating to: ${path}`);
    navigate(path);
  };

  const filteredCourses = courses.filter(course =>
    course && course['Course Name'] &&
    course['Course Name'].toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ... rest of the component remains the same (GroupPage, GroupFinderPage logic, render)

  return (
    <div className="starter-container home-page">
      <Header currentUser={currentUser} />
      {currentUser && (
        <div className="signout-container">
          <button className="signout-button" onClick={handleSignOut}>
            Sign Out
          </button>
        </div>
      )}

      <RedShape color="#1EE1A8" />
      <PinkShape />
      <PurpleShape />

      <nav className="buttons-container-home">
        {/* Navigation links */}
        <a href="#" className="buttons">Courses</a>
        <a href="#" className="buttons" onClick={(e) => { e.preventDefault(); navigate('/group-finder'); }}>Study Groups</a>
        <a href="#" className="buttons" onClick={(e) => { e.preventDefault(); navigate('/chat'); }}>Chats</a>
        <a href="#" className="buttons" onClick={(e) => { e.preventDefault(); navigate('/schedule'); }}>Schedules</a>
        <a href="#" className="buttons" onClick={(e) => { e.preventDefault(); navigate('/book'); }}>Book a Room</a>
      </nav>

      <div className="search-container">
        <input
          type="text"
          placeholder="Search your courses..."
          className="search-bar"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {fetchError && <p className="error-message">{fetchError}</p>}

      <div className="placeholder-container">
          {filteredCourses.length > 0 ? (
              filteredCourses.map((course) => (
                  <button
                      key={course._id || course['Course Name']}
                      className="placeholder-box"
                      onClick={() => handleCourseClick(course['Course Name'])}
                  >
                      {/* Display the 'Course Name' field from the Course model */}
                      {course['Course Name'] || 'Unnamed Course'}
                  </button>
              ))
          ) : (
             !fetchError && <p>No courses found matching your groups or search.</p>
          )}
      </div>

      <button
        className="circular-button"
        onClick={() => navigate('/create-group')}
      >
        Create a Group
      </button>
    </div>
  );
};

export default HomePage;