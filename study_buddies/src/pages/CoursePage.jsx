// src/pages/CoursePage.jsx
import React, { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchGroups } from '../features/groupSlice'; // Import the thunk

// Components and Styles (reuse from HomePage where applicable)
import Header from '../Header';
import RedShape from './components/RedShape';
import PinkShape from './components/PinkShape';
import PurpleShape from './components/PurpleShape';
import './styles/HomePage.css'; // Re-use HomePage styles

const CoursePage = () => {
  const { courseSlug } = useParams(); // Get slug from URL (e.g., "MATH-2930")
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Get currentUser for Header (optional, page is accessible without login)
  const { currentUser } = useSelector((state) => state.auth);
  // Get groups state from Redux store (assuming slice is named 'groups')
  const { groups, loading: isLoading, error } = useSelector((state) => state.groups);

  // Convert slug back to displayable title (replace hyphens with spaces)
  const courseTitle = courseSlug ? courseSlug.replace(/-/g, ' ') : 'Course';

  // --- Fetch Groups using Thunk ---
  useEffect(() => {
    // Fetch groups whenever the courseSlug changes
    if (courseSlug) {
       console.log(`Dispatching fetchGroups for course: ${courseTitle}`);
       // Dispatch the thunk, passing the course title as a filter parameter
       // Assumes fetchGroups thunk is the version *without* auth headers
       dispatch(fetchGroups({ course: courseTitle /*, limit: 20 */ }));
    }
    // No authentication check needed here anymore.
    // Loading and error states are handled by reading from Redux state.
  }, [dispatch, courseSlug, courseTitle]); // Dependencies for re-fetching


  // Function to handle clicking a group box (for future implementation)
  const handleGroupClick = (groupId, groupName) => {
     alert(`Maps to group: ${groupName} (ID: ${groupId}) - Page not implemented yet.`);
     // In the future: navigate(`/groups/${groupId}`);
  }

  // --- Render Logic ---
  return (
    // Reuse layout structure from HomePage
    <div className="starter-container">
      <Header currentUser={currentUser} />

      {/* Decorative Shapes */}
      <RedShape color="#1EE1A8" />
      <PinkShape />
      <PurpleShape />

      {/* Page Header Section */}
      <div className="course-page-header" style={{ textAlign: 'center', margin: '20px 0 30px 0', position: 'relative', zIndex: 5 }}>
         <h1>Study Groups for {courseTitle}</h1>
         <Link to="/home" style={{ color: 'blue', textDecoration: 'underline' }}>Back to Courses</Link>
      </div>

      {/* Search Bar (Optional - could be adapted to search groups) */}
      {/* <div className="search-container">
        <input type="text" placeholder={`Search groups in ${courseTitle}...`} className="search-bar"/>
      </div> */}

      {/* Group Display Area */}
      <div className="placeholder-container"> {/* Reuse class for layout */}
        {isLoading ? (
          <p className="loading-message">Loading groups...</p> // Added class
        ) : error ? (
          // Use the error message from the Redux state
          <p className="error-message">{error}</p>
        ) : groups.length > 0 ? (
          // Map over the groups array from Redux state
          groups.map((group) => (
            <button
              key={group._id}
              className="placeholder-box group-box" // Use placeholder style, add group-box for overrides
              onClick={() => handleGroupClick(group._id, group.groupName)}
              title={`View group: ${group.groupName}`}
            >
              {/* Content within the group box */}
              <div className="group-box-content">
                 <span className="group-name">{group.groupName}</span>
                 <span className="group-members">
                   Members: {group.members?.length || 0} / {group.maxMembers}
                 </span>
              </div>
            </button>
          ))
        ) : (
          // Message when no groups are found
          <p className="no-groups-message">No study groups found for {courseTitle}. Why not create one?</p> // Added class
        )}
      </div>

       {/* Create Group Button */}
       <button
         className="circular-button"
         style={{ backgroundColor: '#1E90FF', bottom: '30px' }} // Adjusted position/color slightly
         title={`Create a new group for ${courseTitle}`}
         // Navigate to create page, pre-filling the course via query parameter
         onClick={() => navigate(`/create-group?course=${encodeURIComponent(courseTitle)}`)}
       >
         Create Group for {courseTitle}
       </button>

    </div>
  );
};

export default CoursePage;