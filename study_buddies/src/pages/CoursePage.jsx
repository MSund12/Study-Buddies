// src/pages/CoursePage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom'; // Ensure useParams is imported
import { useSelector, useDispatch } from 'react-redux';
import { fetchGroups } from '../features/groupSlice';

import Header from '../Header';
import RedShape from './components/RedShape';
import PinkShape from './components/PinkShape';
import PurpleShape from './components/PurpleShape';
import './styles/CoursePage.css'; // Ensure correct CSS import

const CoursePage = () => {
  // --- HOOKS ---
  const { courseSlug } = useParams(); // <-- ADD THIS LINE TO GET THE SLUG
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [currentPage, setCurrentPage] = useState(1);

  // --- Redux State ---
  // Get user for Header etc.
  const { currentUser } = useSelector((state) => state.auth);
  // Get groups slice state
  const groupSliceState = useSelector(state => state.groups);
  // Destructure state with defaults
  const {
      groups = [],
      loading: isLoading = true, // Default loading to true
      error = null,
      totalPages = 0
  } = groupSliceState || {}; // Default to {} if slice state is undefined initially

  // --- Derived State ---
  // Convert slug to displayable title (Now courseSlug should be defined)
  const courseTitle = courseSlug ? courseSlug.replace(/-/g, ' ') : 'Course';

  // --- Effects ---
  // Fetch groups when component mounts or dependencies change
  useEffect(() => {
    // Check if courseSlug is valid before dispatching
    if (courseSlug) {
       dispatch(fetchGroups({ course: courseTitle, page: currentPage, limit: 9 }));
    }
    // Intentionally not showing loading/error messages from here, rely on Redux state
  }, [dispatch, courseSlug, courseTitle, currentPage]);


  // --- Handlers ---
  const handleGroupClick = (groupId, groupName) => {
     alert(`Maps to group: ${groupName} (ID: ${groupId}) - Page not implemented yet.`);
     // navigate(`/groups/${groupId}`);
  };

  // Robust Pagination Handlers
  const handlePrevPage = () => {
      setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
      // Use the safely destructured totalPages
      const validTotalPages = (typeof totalPages === 'number' && totalPages >= 0) ? totalPages : 0;
      setCurrentPage((prev) => (validTotalPages === 0 || prev >= validTotalPages) ? prev : prev + 1);
  };

  // Log pagination values before render for debugging pagination specifically
  console.log('Pagination check:', { currentPage, totalPages, isLoading });

  // --- Render Logic ---
  const validTotalPages = (typeof totalPages === 'number' && totalPages >= 0) ? totalPages : 0;
  console.log('Pagination check:', { currentPage, totalPages, isLoading, error }); // <-- ADDED error
  return (
    <div className="starter-container course-page-container">
      <Header currentUser={currentUser} />

      {/* Decorative Shapes */}
      <RedShape color="#1EE1A8" />
      <PinkShape />
      <PurpleShape />

      {/* Header */}
      <div className="course-page-header">
         <h1>Study Groups for {courseTitle}</h1>
         <Link to="/home" className="back-link">Back to Courses</Link>
      </div>

      {/* Group Display Area */}
      <div className="placeholder-container" role="list">
        {isLoading ? (
          <p className="loading-message">Loading groups...</p>
        ) : error ? (
          <p className="error-message">{error}</p>
        ) : groups.length > 0 ? (
          groups.map((group) => (
            <div
              key={group._id}
              className="group-box" // Use specific class from CoursePage.css
              role="listitem"
              // Removed interactive attributes as requested previously
            >
              <div className="group-box-content">
                 <span className="group-name">{group.groupName}</span>
                 <span className="group-members">
                   Members: {group.members?.length || 0} / {group.maxMembers}
                 </span>
              </div>
            </div>
          ))
        ) : (
          <p className="no-groups-message">No study groups found for {courseTitle}.</p>
        )}
      </div>

      {/* Pagination Controls */}
       {validTotalPages > 1 && ( // Only show if more than one page
           <div className="pagination-controls">
               <button
                   onClick={handlePrevPage}
                   disabled={isLoading || currentPage <= 1}
               >
                   &lt; Previous
               </button>
               <span>Page {currentPage} of {validTotalPages}</span>
               <button
                   onClick={handleNextPage}
                   disabled={isLoading || currentPage >= validTotalPages}
               >
                   Next &gt;
               </button>
           </div>
       )}

       {/* Create Group Button */}
       <button
         className="circular-button"
         style={{ backgroundColor: '#1E90FF', bottom: '30px', right: '30px' }}
         title={`Create a new group for ${courseTitle}`}
         onClick={() => navigate(`/create-group?course=${encodeURIComponent(courseTitle)}`)}
       >
         Create Group
       </button>

    </div>
  );
};

export default CoursePage;