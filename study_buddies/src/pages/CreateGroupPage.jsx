import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
// Use the standard named import (which should be working now)
import { createGroup, clearMessages } from '../features/groupSlice';
import { useNavigate, useLocation } from 'react-router-dom'; // Added useLocation
import './styles/CreateGroupPage.css';
import Header from '../Header';

// Removed the debugging console logs from here

const CreateGroupPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation(); // Hook to read query parameters
  const currentUser = useSelector((state) => state.auth.currentUser);

  // --- State ---
  const [groupData, setGroupData] = useState({
    course: '',
    groupName: '',
    maxMembers: ''
  });
  const [courseSearch, setCourseSearch] = useState('');
  const [courseResults, setCourseResults] = useState([]);

  // Read state from groups slice
  const { loading, error, successMessage } = useSelector((state) => state.groups);

  // --- Effects ---
  // Effect to pre-fill course from URL query parameter
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const courseFromQuery = queryParams.get('course');
    if (courseFromQuery) {
      setGroupData(prevData => ({ ...prevData, course: courseFromQuery }));
    }
  }, [location.search]); // Run when URL query params change

  // Effect to clear messages on mount/unmount
  useEffect(() => {
    // Dispatch clearMessages on mount
    if (typeof clearMessages === 'function') { // Safety check (optional now)
      dispatch(clearMessages());
    }

    // Return a cleanup function to clear messages when navigating away
    return () => {
       if (typeof clearMessages === 'function') {
            dispatch(clearMessages());
       }
    };
  }, [dispatch]); // Only depends on dispatch

  // Effect for searching courses (debounced)
  useEffect(() => {
    const fetchCourses = async () => {
      if (!courseSearch.trim()) {
        setCourseResults([]);
        return;
      }
      try {
        // Make sure this endpoint exists and works without auth if needed
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
  }, [courseSearch]);

  // --- Handlers ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setGroupData({ ...groupData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Ensure course is selected before submitting
    if (!groupData.course) {
       // You might want to set an error state here instead of just logging
       console.error("Please select a course first.");
       return; // Prevent submission if no course is selected
    }
    dispatch(createGroup(groupData));
    // Consider clearing form only on success? Or navigate away?
    // setGroupData({ course: '', groupName: '', maxMembers: '' });
  };

  const handleSelectCourse = (dept, courseId) => {
    const fullCourseName = `${dept} ${courseId}`;
    setGroupData({ ...groupData, course: fullCourseName });
    setCourseSearch(fullCourseName); // Update search input to show selection
    setCourseResults([]); // Clear results
  };

  // --- Render ---
  return (
    <div className="starter-container">
      <Header currentUser={currentUser} />

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
              // Clear selected course if user types again after selecting
              onChange={(e) => {
                   setCourseSearch(e.target.value);
                   if (groupData.course) setGroupData({...groupData, course: ''});
              }}
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
            {courseResults.length === 0 && courseSearch && (
              <p className="no-results">No matching courses found.</p>
            )}
          </div>

          {/* Display Selected Course (Read-only) */}
          {groupData.course && (
             <div className="input-group">
                 <label>Selected Course</label>
                 <input type="text" value={groupData.course} readOnly disabled className="selected-course-display"/>
             </div>
           )}

          {/* Group Name Input */}
          <div className="input-group">
            <label htmlFor="groupName">Group Name</label>
            <input
              type="text"
              id ="groupName"
              name="groupName"
              placeholder="Enter group name"
              value={groupData.groupName}
              onChange={handleInputChange}
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
              min="1" // Add min attribute
              value={groupData.maxMembers}
              onChange={handleInputChange}
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