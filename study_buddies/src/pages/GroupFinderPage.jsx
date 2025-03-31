// src/pages/GroupFinderPage.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../features/authSlice';
import RedShape from './components/RedShape';
import PinkShape from './components/PinkShape';
import PurpleShape from './components/PurpleShape';
// Ensure fetchGroups is adapted to handle pagination parameters { page, limit, sortOrder }
import { fetchGroups } from '../features/groupSlice';
import { useNavigate } from 'react-router-dom';
import "./styles/GroupFinderPage.css";
import Header from '../Header';

// Define items per page
const ITEMS_PER_PAGE = 8;

const GroupFinderPage = ({ onBack, onSelectGroup }) => {
  const currentUser = useSelector((state) => state.auth.currentUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // --- State Hooks ---
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1); // State for current page number

  // Handle logout
  const handleSignOut = () => {
    dispatch(logout());
    navigate('/signin');
  };

  // --- Read state from Redux ---
  // Make sure your groups slice provides totalPages
  const {
      groups = [],
      loading: isLoading = true,
      error = null,
      totalPages = 0 // Get totalPages from Redux state
      // Optionally get currentPage from Redux if needed: reduxCurrentPage = 1
  } = useSelector((state) => state.groups || {}); // Ensure initial state is handled

  // --- Fetch groups based on current page and sort order ---
  useEffect(() => {
    // Dispatch fetchGroups with pagination and sorting parameters
    dispatch(fetchGroups({
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        sortOrder: sortOrder
        // Add other filters like 'search' or 'course' here if needed
    }));
  // Refetch when dispatch function, currentPage, or sortOrder changes
  }, [dispatch, currentPage, sortOrder]);

  // --- Sorting Logic ---
  // This now sorts the groups *of the current page* locally.
  // Alternatively, rely solely on backend sorting passed via fetchGroups.
  const sortedGroups = React.useMemo(() => {
      if (!Array.isArray(groups)) return [];
      return [...groups].sort((a, b) => {
          const courseA = a.course || '';
          const courseB = b.course || '';
          if (sortOrder === 'asc') {
              return courseA.localeCompare(courseB);
          } else {
              return courseB.localeCompare(courseA);
          }
      });
  }, [groups, sortOrder]);

  // Handler for clicking a group
  const handleGroupClick = (group) => {
    console.log("Selected Group:", group);
    if (onSelectGroup) {
        onSelectGroup(group);
    } else {
        alert(`Selected Group: ${group.groupName}`);
    }
  };

  // --- Pagination Handlers ---
  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1)); // Go back one page, minimum 1
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages)); // Go forward one page, maximum totalPages
  };


  // --- Render Component ---
  return (
    <div className="starter-container">
      <Header currentUser={currentUser} />

      {/* Sign Out Button */}
      {currentUser && (
         <div className="signout-container">
           <button className="signout-button" onClick={handleSignOut}>Sign Out</button>
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

      {/* Optional Back Button */}
      {onBack && <button onClick={onBack} className="back-button"> &lt; Back</button>}

      <h2 className="page-title">Find a Study Group</h2>

      {/* Sorting Controls */}
      <div className="sorting-controls">
        <label htmlFor="sortOrderSelect">Sort by Course Code:</label>
        <select id="sortOrderSelect" value={sortOrder} onChange={(e) => { setSortOrder(e.target.value); setCurrentPage(1); }}> {/* Reset to page 1 on sort change */}
          <option value="asc">Ascending (A-Z)</option>
          <option value="desc">Descending (Z-A)</option>
        </select>
      </div>

      {/* Optional Search Bar */}
      {/* ... search input ... */}

      {/* Display Loading or Error States */}
      {isLoading && <p className="loading-message">Loading groups...</p>}
      {error && <p className="error-message">{error}</p>}

      {/* Group Display Area */}
      <div className="placeholder-container">
        {/* Message if no groups are found after loading */}
        {!isLoading && !error && sortedGroups.length === 0 && totalPages <= 1 && (
            <p className="no-groups-message">No groups found.</p>
        )}
        {/* Message if current page has no groups (but others might) */}
        {!isLoading && !error && sortedGroups.length === 0 && totalPages > 1 && currentPage > totalPages && (
             <p className="no-groups-message">No groups on this page.</p> // Or adjust logic based on how backend handles invalid pages
        )}

        {/* Render the 8 groups for the current page */}
        {!isLoading && !error && sortedGroups.map((group) => (
          <div
            key={group._id}
            className="group-box"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleGroupClick(group)}
            title={`Select group: ${group.groupName}`}
          >
             <div className="group-box-content">
               <span className="group-name">{group.groupName}</span>
               <span className="group-course">{group.course}</span>
               <span className="group-members">
                 Members: {group.members?.length || 0} / {group.maxMembers}
               </span>
             </div>
          </div>
        ))}
      </div>

      {/* --- Pagination Controls --- */}
      {!isLoading && !error && totalPages > 1 && ( // Only show controls if there's more than one page
        <div className="pagination-controls">
          <button
            onClick={handlePreviousPage}
            disabled={currentPage === 1} // Disable if on first page
            className="pagination-button"
          >
            &lt; Previous
          </button>
          <span className="page-indicator">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={handleNextPage}
            disabled={currentPage >= totalPages} // Disable if on last page
            className="pagination-button"
          >
            Next &gt;
          </button>
        </div>
      )}
       {/* --- End Pagination Controls --- */}

    </div>
  );
};

export default GroupFinderPage;