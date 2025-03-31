import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../features/authSlice';
// *** NOTE: Ensure createGroup in groupSlice doesn't expect maxMembers ***
// You might need to adjust the createGroup action/reducer if it expects maxMembers
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

  // --- MODIFICATION START ---
  // Remove maxMembers from initial state
  const [groupData, setGroupData] = useState({
    course: '',
    groupName: '',
    // maxMembers: '' // REMOVED
  });
  // --- MODIFICATION END ---

  const [courseSearch, setCourseSearch] = useState('');
  const [courseResults, setCourseResults] = useState([]);
  const [formError, setFormError] = useState('');

  const { loading, error: groupError, successMessage } = useSelector((state) => state.groups);

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
        const response = await fetch(`http://localhost:5000/api/courses/search?query=${encodeURIComponent(courseSearch)}`);
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
    // No change needed here, as 'maxMembers' input won't exist
    setGroupData({ ...groupData, [name]: value });
    setFormError('');
  };

  const handleCourseSearchChange = (e) => {
      const newSearchValue = e.target.value;
      setCourseSearch(newSearchValue);
      setFormError('');
      if (newSearchValue.trim() === '' || newSearchValue.trim() !== groupData.course) {
          setGroupData({...groupData, course: ''});
      }
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError(''); // Clear previous form errors

    if (!groupData.course) {
      setFormError("Please select a course first.");
      return;
    }

    // --- MODIFICATION START ---
    // Remove validation for maxMembers
    // const maxMembersNum = 8; // No longer needed
    // if (isNaN(maxMembersNum) || maxMembersNum <= 0) {
    //     setFormError("Please enter a valid number of maximum members (at least 1).");
    //     return;
    // }
    // --- MODIFICATION END ---


    // Dispatch the action - groupData now only contains course and groupName
    // Ensure your createGroup action/slice handles this correctly (doesn't require maxMembers)
    dispatch(createGroup(groupData));
  };

  const handleSelectCourse = (dept, courseId) => {
    const fullCourseName = `${dept} ${courseId}`;
    setGroupData({ ...groupData, course: fullCourseName });
    setCourseSearch(fullCourseName);
    setCourseResults([]);
    setFormError('');
  };

  // --- MODIFICATION START ---
  // Update disabled logic - no longer depends on maxMembers
  // It only depends on loading state and if a course has been selected
  const isSubmitDisabled = loading || !groupData.course || !groupData.groupName.trim(); // Added check for groupName
  // --- MODIFICATION END ---


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
              required
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
            {/* Display selected course if needed */}
            {/* {groupData.course && <p className="selected-course">Selected: {groupData.course}</p>} */}
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

          {/* --- MODIFICATION START --- */}
          {/* Max Members Input - REMOVED */}
          {/*
          <div className="input-group">
            <label htmlFor="maxMembers">Max Members (1-8)</label>
            <input
              // ... attributes ...
            />
          </div>
          */}
          {/* --- MODIFICATION END --- */}


          {/* Submit Button */}
          <button
            type="submit"
            className="create-group-button"
            disabled={isSubmitDisabled} // Use updated disabled logic
          >
            {loading ? 'Creating...' : 'Create Group'}
          </button>
        </form>

        {/* Status Messages */}
        {formError && <p className="status-message error">{formError}</p>}
        {!formError && successMessage && <p className="status-message success">{successMessage}</p>}
        {!formError && groupError && <p className="status-message error">{groupError}</p>}

      </div>
    </div>
  );
};

export default CreateGroupPage;