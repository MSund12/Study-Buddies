import React, { useState } from 'react';

const GroupFinderPage = ({ onBack, onSelectGroup }) => {
  const [sortOrder, setSortOrder] = useState('asc'); // Sorting order state
  const groups = [
    { id: 1, name: 'EECS 2311' },
    { id: 2, name: 'Math 2015' },
    { id: 3, name: 'ENG 2003' },
    { id: 4, name: 'LOLZ Academy' },
    { id: 5, name: 'LLMS DUDE' },
  ];

  // Sorting logic
  const sortedGroups = [...groups].sort((a, b) => {
    if (sortOrder === 'asc') {
      return a.name.localeCompare(b.name);
    } else {
      return b.name.localeCompare(a.name);
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

      {/* Group Display */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginTop: '16px' }}>
        {sortedGroups.map((group) => (
          <div
            key={group.id}
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
            {group.name}
          </div>
        ))}
      </div>
    </div>
  );
};

export default GroupFinderPage;
