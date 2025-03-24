import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createGroup, clearMessages } from '../features/groupSlice';
import { useNavigate } from 'react-router-dom';
import './styles/CreateGroupPage.css';
import Header from '../Header';

const CreateGroupPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const currentUser = useSelector((state) => state.auth.currentUser);

  const [groupData, setGroupData] = useState({
    course: '',
    groupName: '',
    maxMembers: ''
  });

  const [courseSearch, setCourseSearch] = useState('');
  const [courseResults, setCourseResults] = useState([]);

  const { loading, error, successMessage } = useSelector((state) => state.groups);

  // Clear success/error messages when navigating away
  useEffect(() => {
    dispatch(clearMessages());
  }, [dispatch]);

  // Search for courses from the database
  useEffect(() => {
    const fetchCourses = async () => {
      if (!courseSearch.trim()) {
        setCourseResults([]);
        return;
      }

      try {
        const response = await fetch(`http://localhost:5000/api/courses/search?query=${courseSearch}`);
        const data = await response.json();

        if (response.ok) {
          setCourseResults(data);
        } else {
          setCourseResults([]);
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
        setCourseResults([]);
      }
    };

    const delaySearch = setTimeout(fetchCourses, 300); // Add debounce to reduce API calls
    return () => clearTimeout(delaySearch); // Clear timeout on cleanup
  }, [courseSearch]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setGroupData({ ...groupData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(createGroup(groupData));
    setGroupData({ course: '', groupName: '', maxMembers: '' }); // Clear form fields
  };

  // Handle course selection from search results
  const handleSelectCourse = (dept, courseId) => {
    setGroupData({ ...groupData, course: `${dept} ${courseId}` });
    setCourseSearch(''); // Clear search input after selection
    setCourseResults([]); // Clear displayed results
  };

  return (
    <div className="starter-container">
      <Header currentUser={currentUser} />

      <div className="create-group-container">
        <h2>Create a New Study Group</h2>

        <form onSubmit={handleSubmit} className="create-group-form">
          {/* Course Search Bar */}
          <div className="input-group">
            <label htmlFor="course">Search Course Code</label>
            <input
              type="text"
              id="courseSearch"
              name="courseSearch"
              placeholder="Type Dept or Course ID"
              value={courseSearch}
              onChange={(e) => setCourseSearch(e.target.value)}
            />

            {/* Display Matching Results */}
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

          {/* Display 'No Results' Message */}
            {courseResults.length === 0 && courseSearch && (
              <p className="no-results">No matching courses found.</p>
            )}
          </div>

          {/* Display Selected Course */}
          {groupData.course && (
            <p className="selected-course">
              Selected Course: <strong>{groupData.course}</strong>
            </p>
          )}

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

          <div className="input-group">
            <label htmlFor="maxMembers">Max Members</label>
            <input
              type="number"
              id="maxMembers"
              name="maxMembers"
              placeholder="Enter max members"
              value={groupData.maxMembers}
              onChange={handleInputChange}
              required
            />
          </div>

          <button type="submit" className="create-group-button" disabled={loading}>
            {loading ? 'Creating...' : 'Create Group'}
          </button>
        </form>

        {successMessage && <p className="status-message success">{successMessage}</p>}
        {error && <p className="status-message error">{error}</p>}
      </div>
    </div>
  );
};

export default CreateGroupPage;
