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
    maxMembers: '' // Keep as string initially to handle empty input
  });
  const [courseSearch, setCourseSearch] = useState('');
  const [courseResults, setCourseResults] = useState([]);
  // Optional: State for form-specific errors
  const [formError, setFormError] = useState('');

  const { loading, error: groupError, successMessage } = useSelector((state) => state.groups); // Renamed error to groupError to avoid conflict

  const handleSignOut = () => {
      dispatch(logout());
      navigate('/starter');
    };

  // Effect to pre-fill course from URL query parameter
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const courseFromQuery = queryParams.get('course');
    if (courseFromQuery) {
      setGroupData(prevData => ({ ...prevData, course: courseFromQuery }));
      setCourseSearch(courseFromQuery);
    }
  }, [location.search]);

  // Effect to clear messages on mount/unmount
  useEffect(() => {
    if (typeof clearMessages === 'function') {
      dispatch(clearMessages());
    }
    // Clear form-specific error on mount
    setFormError('');
    return () => {
       if (typeof clearMessages === 'function') {
           dispatch(clearMessages());
       }
    };
  }, [dispatch]);

  // Effect for searching courses (debounced)
  useEffect(() => {
    const fetchCourses = async () => {
      if (!courseSearch.trim() || courseSearch.trim() === groupData.course) {
        setCourseResults([]);
        return;
      }
      try {
        const response = await fetch(`http://localhost:5000/api/courses/search?query=${encodeURIComponent(courseSearch)}`); // Added encodeURIComponent
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
  }, [courseSearch, groupData.course]);

  // --- Handlers ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setGroupData({ ...groupData, [name]: value });
    // Clear form error when user types
    setFormError('');
  };

  const handleCourseSearchChange = (e) => {
      const newSearchValue = e.target.value;
      setCourseSearch(newSearchValue);
      // Clear form error when user types
      setFormError('');
      if (newSearchValue.trim() === '' || newSearchValue.trim() !== groupData.course) {
          setGroupData({...groupData, course: ''});
      }
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError(''); // Clear previous form errors

    if (!groupData.course) {
      setFormError("Please select a course first."); // Use state for error message
      return;
    }

    // Validate maxMembers
    const maxMembersNum = parseInt(groupData.maxMembers, 10);
    if (isNaN(maxMembersNum) || maxMembersNum <= 0) {
         setFormError("Please enter a valid number of maximum members (at least 1).");
         return;
    }

    // *** ADDED VALIDATION FOR MAX MEMBERS <= 8 ***
    if (maxMembersNum > 8) {
      setFormError("Maximum number of group members cannot exceed 8."); // Use state for error message
      return; // Stop submission
    }

    // If validation passes, dispatch the action
    dispatch(createGroup(groupData));
    // Optionally navigate or clear form on success via extraReducers in groupSlice
  };

  const handleSelectCourse = (dept, courseId) => {
    const fullCourseName = `${dept} ${courseId}`;
    setGroupData({ ...groupData, course: fullCourseName });
    setCourseSearch(fullCourseName);
    setCourseResults([]);
    // Clear form error when course is selected
    setFormError('');
  };

  // Calculate if button should be disabled based also on maxMembers
  const isMaxMembersInvalid = groupData.maxMembers ? parseInt(groupData.maxMembers, 10) > 8 : false;
  const isSubmitDisabled = loading || !groupData.course || isMaxMembersInvalid;


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
              onChange={handleCourseSearchChange}
              autoComplete="off"
              required // Ensure course search isn't empty technically, selection is handled below
            />
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
            {courseResults.length === 0 && courseSearch && courseSearch !== groupData.course && (
              <p className="no-results">No matching courses found.</p>
            )}
          </div>

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
            <label htmlFor="maxMembers">Max Members (1-8)</label> {/* Updated label */}
            <input
              type="number"
              id="maxMembers"
              name="maxMembers"
              placeholder="e.g., 5"
              min="1"
              max="8" // *** ADDED HTML MAX ATTRIBUTE ***
              value={groupData.maxMembers}
              onChange={handleInputChange}
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="create-group-button"
            // *** UPDATED DISABLED LOGIC ***
            disabled={isSubmitDisabled}
          >
            {loading ? 'Creating...' : 'Create Group'}
          </button>
        </form>

        {/* Status Messages */}
        {/* Display form-specific error first if it exists */}
        {formError && <p className="status-message error">{formError}</p>}
        {/* Display Redux success/error messages if no form error */}
        {!formError && successMessage && <p className="status-message success">{successMessage}</p>}
        {!formError && groupError && <p className="status-message error">{groupError}</p>}

      </div>
    </div>
  );
};

export default CreateGroupPage;