import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchGroups } from '../features/groupSlice';

const GroupFinderPage = ({ onBack, onSelectGroup }) => {
  const dispatch = useDispatch();
  const { groups, loading, error } = useSelector((state) => state.groups);

  const [sortOrder, setSortOrder] = useState('asc'); // Sorting order state

  // Fetch groups from the database when the page loads
  useEffect(() => {
    dispatch(fetchGroups());
  }, [dispatch]);

  // Sorting logic
  const sortedGroups = [...groups].sort((a, b) => {
    if (sortOrder === 'asc') {
      return a.groupName.localeCompare(b.groupName);
    } else {
      return b.groupName.localeCompare(a.groupName);
    }
  });

  return (
    <div>
      <button onClick={onBack} className="px-4 py-2 bg-gray-400 text-white rounded">Back</button>

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
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginTop: '16px' }}>
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
      </div>
    </div>
  );
};

export default GroupFinderPage;
