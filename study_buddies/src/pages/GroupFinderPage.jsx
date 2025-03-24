import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchGroups } from '../features/groupSlice';
import "./styles/GroupFinderPage.css"
import Header from '../Header';



const GroupFinderPage = ({ onBack, onSelectGroup }) => {
  const currentUser = useSelector((state) => state.auth.currentUser);
  const dispatch = useDispatch();
  const { groups = [], loading, error } = useSelector((state) => state.groups); // Default groups to an empty array

  const [sortOrder, setSortOrder] = useState('asc');

  // Fetch groups when the page loads
  useEffect(() => {
    dispatch(fetchGroups());
  }, [dispatch]);

  // Sorting logic with a defensive array check
  const sortedGroups = Array.isArray(groups)
    ? [...groups].sort((a, b) => {
        if (sortOrder === 'asc') {
          return a.groupName.localeCompare(b.groupName);
        } else {
          return b.groupName.localeCompare(a.groupName);
        }
      })
    : [];

  return (
    <div className="starting-container">
      <Header currentUser={currentUser} />

      {/* Sorting Controls */}
      <div className="sorting-controls">
        <label>Sort by Course Code:</label>
        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>
      </div>

      {/* Display Loading or Error States */}
      {loading && <p>Loading groups...</p>}
      {error && <p className="error-message">{error}</p>}

      {/* Group Display */}
      <div className="group-display">
        {sortedGroups.map((group) => (
          <div
            key={group._id}
            onClick={() => onSelectGroup(group)}
            style={{
              width: '150px',
              height: '100px',
              border: '1px solid #ccc',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '8px',
              cursor: 'pointer',
              backgroundColor: 'black',
              color: 'white'
            }}
          >
            {group.groupName} - {group.course}
          </div>
        ))}
        {!loading && sortedGroups.length === 0 && <p>No groups found.</p>}
      </div>
    </div>
  );
};

export default GroupFinderPage;
