import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../features/authSlice';
import { createGroup, clearMessages } from '../features/groupSlice';
import { useNavigate, useLocation } from 'react-router-dom';
import RedShape from './components/RedShape';
import PinkShape from './components/PinkShape';
import PurpleShape from './components/PurpleShape';
import './styles/CreateGroupPage.css';
import Header from '../Header';

const CreateGroupPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = useSelector((state) => state.auth.currentUser);

  const [groupData, setGroupData] = useState({
    course: '',
    groupName: '',
    maxMembers: ''
  });
  const [courseSearch, setCourseSearch] = useState('');
  const [courseResults, setCourseResults] = useState([]);

  const { loading, error, successMessage } = useSelector((state) => state.groups);

  const handleSignOut = () => {
      dispatch(logout());
      navigate('/starter');
    };

  // Effect to pre-fill course from URL query parameter
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const courseFromQuery = queryParams.get('course');
    if (courseFromQuery) {
      // Pre-fill both the form data and the search display field
      setGroupData(prevData => ({ ...prevData, course: courseFromQuery }));
      setCourseSearch(courseFromQuery);
    }
  }, [location.search]);

  // Effect to clear messages on mount/unmount
  useEffect(() => {
    if (typeof clearMessages === 'function') {
      dispatch(clearMessages());
    }
    return () => {
       if (typeof clearMessages === 'function') {
            dispatch(clearMessages());
       }
    };
  }, [dispatch]);

  // Effect for searching courses (debounced)
  useEffect(() => {
    const fetchCourses = async () => {
      // Don't search if the search input exactly matches the selected course
      if (!courseSearch.trim() || courseSearch.trim() === groupData.course) {
        setCourseResults([]);
        return;
      }
      try {
        const response = await fetch(`http://localhost:5000/api/courses/search?query=${courseSearch}`);
        const data = await response.json();
        if (response.ok && Array.isArray(data)) {
          setCourseResults(data);
        } else {
          console.warn("Course search response not ok or not an array:", data);
          setCourseResults([]);
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
        setCourseResults([]);
      }
    };

    const delaySearch = setTimeout(fetchCourses, 300);
    return () => clearTimeout(delaySearch);
  }, [courseSearch, groupData.course]); // Added groupData.course dependency

  // --- Handlers ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setGroupData({ ...groupData, [name]: value });
  };

  // Handler for the Course Search input only
  const handleCourseSearchChange = (e) => {
      const newSearchValue = e.target.value;
      setCourseSearch(newSearchValue);
      // If user clears input OR types something different than the selected course,
      // clear the actual selected course in the form data.
      if (newSearchValue.trim() === '' || newSearchValue.trim() !== groupData.course) {
          setGroupData({...groupData, course: ''});
      }
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!groupData.course) {
       // Set error state instead of console.error for user feedback
       // setError("Please select a course first."); // Requires adding setError state
       alert("Please select a course first."); // Simple alert for now
       return;
    }
    dispatch(createGroup(groupData));
    // Optionally navigate or clear form on success via extraReducers
  };

  const handleSelectCourse = (dept, courseId) => {
    const fullCourseName = `${dept} ${courseId}`;
    // Set the course value for submission
    setGroupData({ ...groupData, course: fullCourseName });
    // Set the search input to display the selected course
    setCourseSearch(fullCourseName);
    // Clear the search results dropdown
    setCourseResults([]);
  };

  // --- Render ---
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
         <a href="#" className="buttons">Courses</a>
         <a href="#" className="buttons" onClick={(e) => { e.preventDefault(); navigate('/group-finder'); }}>Study Groups</a>
         <a href="#" className="buttons" onClick={(e) => { e.preventDefault(); navigate('/chat'); }}>Chats</a>
         <a href="#" className="buttons" onClick={(e) => { e.preventDefault(); navigate('/schedule'); }}>Schedules</a>
         <a href="#" className="buttons" onClick={(e) => { e.preventDefault(); navigate('/book'); }}>Book a Room</a>
      </nav>

      <div className="create-group-container">
        <h2>Create a New Study Group</h2>

        <form onSubmit={handleSubmit} className="create-group-form">
          {/* Course Search and Selection */}
          <div className="input-group">
            <label htmlFor="courseSearch">Search & Select Course</label>
            <input
              type="text"
              id="courseSearch"
              name="courseSearch"
              placeholder="Type Dept or Course ID (e.g., EECS 2311)"
              value={courseSearch}
              // Use the dedicated handler now
              onChange={handleCourseSearchChange}
              autoComplete="off"
            />
            {/* Search Results Dropdown */}
            {courseResults.length > 0 && (
              <ul className="course-results">
                {courseResults.map((course) => (
                  <li
                    key={course._id}
                    onClick={() => handleSelectCourse(course.Dept, course['Course ID'])}
                    className="course-item"
                  >
                    {course.Dept} {course['Course ID']} - {course['Course Name']}
                  </li>
                ))}
              </ul>
            )}
            {/* No Results Message */}
            {courseResults.length === 0 && courseSearch && courseSearch !== groupData.course && (
              <p className="no-results">No matching courses found.</p>
            )}
          </div>

          {/* --- REMOVED the separate "Selected Course" display --- */}

          {/* Group Name Input */}
          <div className="input-group">
            <label htmlFor="groupName">Group Name</label>
            <input
              type="text"
              id ="groupName"
              name="groupName"
              placeholder="Enter group name"
              value={groupData.groupName}
              onChange={handleInputChange} // Uses generic input handler
              required
            />
          </div>

          {/* Max Members Input */}
          <div className="input-group">
            <label htmlFor="maxMembers">Max Members</label>
            <input
              type="number"
              id="maxMembers"
              name="maxMembers"
              placeholder="e.g., 5"
              min="1"
              value={groupData.maxMembers}
              onChange={handleInputChange} // Uses generic input handler
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="create-group-button"
            disabled={loading || !groupData.course} // Disable if loading or no course selected
          >
            {loading ? 'Creating...' : 'Create Group'}
          </button>
        </form>

        {/* Status Messages */}
        {successMessage && <p className="status-message success">{successMessage}</p>}
        {error && <p className="status-message error">{error}</p>}
      </div>
    </div>
  );
};

export default CreateGroupPage;