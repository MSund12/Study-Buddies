// src/pages/CoursePage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchGroups } from '../features/groupSlice';

import Header from '../Header';
import RedShape from './components/RedShape';
import PinkShape from './components/PinkShape';
import PurpleShape from './components/PurpleShape';
import './styles/CoursePage.css'; // <-- Import the new specific CSS file

const CoursePage = () => {
  // ... (hooks, state, functions remain the same) ...
  const { courseSlug } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.auth);
  const { groups, loading: isLoading, error, totalPages } = useSelector((state) => state.groups);
  const [currentPage, setCurrentPage] = useState(1);
  const courseTitle = courseSlug ? courseSlug.replace(/-/g, ' ') : 'Course';

  useEffect(() => {
    if (courseSlug) {
       dispatch(fetchGroups({ course: courseTitle, page: currentPage, limit: 9 }));
    }
  }, [dispatch, courseSlug, courseTitle, currentPage]);

  const handleGroupClick = (groupId, groupName) => {
     alert(`Maps to group: ${groupName} (ID: ${groupId}) - Page not implemented yet.`);
     // navigate(`/groups/${groupId}`);
  };

  const handlePrevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleNextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));

  // Log pagination state just before render
  console.log('Pagination check:', { currentPage, totalPages, isLoading });

  return (
    // Keep starter-container if it provides useful base styles, or use course-page-container
    <div className="starter-container course-page-container">
      <Header currentUser={currentUser} />

      {/* ... Shapes ... */}
       <RedShape color="#1EE1A8" />
       <PinkShape />
       <PurpleShape />


      <div className="course-page-header">
         <h1>Study Groups for {courseTitle}</h1>
         <Link to="/home" className="back-link">Back to Courses</Link>
      </div>

      {/* Group Display Area - uses placeholder-container for layout */}
      <div className="placeholder-container">
        {isLoading ? ( <p className="loading-message">Loading groups...</p> )
         : error ? ( <p className="error-message">{error}</p> )
         : groups.length > 0 ? (
            groups.map((group) => (
              // --- Use only 'group-box' class now ---
              <div
                key={group._id}
                className="group-box" // <-- CHANGED CLASS NAME
                onClick={() => handleGroupClick(group._id, group.groupName)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleGroupClick(group._id, group.groupName)}
                title={`View group: ${group.groupName}`}
              >
                <div className="group-box-content">
                   <span className="group-name">{group.groupName}</span>
                   <span className="group-members">
                     Members: {group.members?.length || 0} / {group.maxMembers}
                   </span>
                </div>
              </div>
              // --- END CHANGE ---
            ))
          ) : ( <p className="no-groups-message">No study groups found for {courseTitle}.</p> )
        }
      </div>

      {/* Pagination Controls */}
       <div className="pagination-controls">
           <button onClick={handlePrevPage} disabled={isLoading || currentPage <= 1}>
               &lt; Previous
           </button>
           <span>Page {currentPage} of {totalPages > 0 ? totalPages : 1}</span>
           <button onClick={handleNextPage} disabled={isLoading || currentPage >= totalPages}>
               Next &gt;
           </button>
       </div>

       {/* Create Group Button */}
       <button
         className="circular-button" // Keep this class if style is defined globally or in HomePage.css
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