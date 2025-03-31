// src/pages/GroupFinderPage.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchGroups } from '../features/groupSlice'; // Assuming fetchGroups fetches ALL groups when no filter passed
import { useNavigate } from 'react-router-dom'; // Added useNavigate for potential future use
import "./styles/GroupFinderPage.css"; // Import specific CSS
import Header from '../Header';

const GroupFinderPage = ({ onBack, onSelectGroup }) => {
  const currentUser = useSelector((state) => state.auth.currentUser);
  const dispatch = useDispatch();
  const navigate = useNavigate(); // Initialize navigate

  // Read state from Redux, provide defaults
  const {
      groups = [],
      loading: isLoading = true, // Default to loading
      error = null,
      // Include pagination info if needed, otherwise default groups is fine
      // totalPages = 0,
      // currentPage = 1
  } = useSelector((state) => state.groups || {}); // Default to {} if slice is undefined

  const [sortOrder, setSortOrder] = useState('asc');
  // Add state for search term if you want to add search later
  // const [searchTerm, setSearchTerm] = useState('');

  // Fetch all groups when the component mounts (no filters)
  useEffect(() => {
    // Dispatch fetchGroups without any parameters to get all (or first page)
    dispatch(fetchGroups({ limit: 50 })); // Fetch more groups, add pagination later if needed
  }, [dispatch]);

  // Sorting logic - SORT BY COURSE CODE NOW
  const sortedGroups = React.useMemo(() => {
        if (!Array.isArray(groups)) return []; // Defensive check
        return [...groups].sort((a, b) => {
            // Handle potential undefined/null course values gracefully
            const courseA = a.course || '';
            const courseB = b.course || '';
            if (sortOrder === 'asc') {
                return courseA.localeCompare(courseB);
            } else {
                return courseB.localeCompare(courseA);
            }
        });
   }, [groups, sortOrder]); // Recalculate only when groups or sortOrder change


  // Handler for clicking a group (calls prop function)
  const handleGroupClick = (group) => {
      console.log("Selected Group:", group);
      // Call the onSelectGroup prop passed from the parent component (e.g., HomePage)
      if (onSelectGroup) {
          onSelectGroup(group);
      } else {
          // Fallback or alternative navigation if needed
          // navigate(`/groups/${group._id}`); // Example
          alert(`Selected Group: ${group.groupName}`);
      }
  };

  return (
    // Use starter-container for consistent base layout
    <div className="starter-container group-finder-container"> {/* Added specific class */}
      <Header currentUser={currentUser} />

       {/* Add a back button if this page isn't the root */}
       {onBack && <button onClick={onBack} className="back-button"> &lt; Back</button>}

       <h2 className="page-title">Find a Study Group</h2>

      {/* Sorting Controls - Centered */}
      <div className="sorting-controls">
        <label htmlFor="sortOrderSelect">Sort by Course Code:</label>
        <select id="sortOrderSelect" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
          <option value="asc">Ascending (A-Z)</option>
          <option value="desc">Descending (Z-A)</option>
        </select>
      </div>

      {/* Optional Search Bar */}
      {/* <div className="search-container">
          <input type="text" placeholder="Search groups by name or course..." className="search-bar"/>
      </div> */}


      {/* Display Loading or Error States */}
      {isLoading && <p className="loading-message">Loading groups...</p>}
      {error && <p className="error-message">{error}</p>}

      {/* Group Display - Use placeholder-container for layout */}
      <div className="placeholder-container">
        {!isLoading && !error && sortedGroups.length === 0 && <p className="no-groups-message">No groups found.</p>}
        {!isLoading && !error && sortedGroups.map((group) => (
          // Use div, apply 'group-box' class for styling
          <div
            key={group._id}
            className="group-box" // Use the same class as CoursePage for red box style
            onClick={() => handleGroupClick(group)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleGroupClick(group)}
            title={`Select group: ${group.groupName}`}
          >
             {/* Use consistent content structure */}
             <div className="group-box-content">
               <span className="group-name">{group.groupName}</span>
               <span className="group-course">{group.course}</span> {/* Display course */}
               <span className="group-members">
                 Members: {group.members?.length || 0} / {group.maxMembers}
               </span>
            </div>
          </div>
        ))}
      </div>

       {/* Pagination controls would go here if implemented */}

    </div>
  );
};

export default GroupFinderPage;