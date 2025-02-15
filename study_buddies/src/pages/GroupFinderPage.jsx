import React from 'react';

const GroupFinderPage = ({ onBack, onSelectGroup }) => {
  const groups = [
    { id: 1, name: 'EECS 2311' },
    { id: 2, name: 'Math 2015' },
    { id: 3, name: 'ENG 2003' },
    { id: 4, name: 'LOLZ Academy' },
    { id: 5, name: 'LLMS DUDE' },
  ];

  return (
    <div>
      <button onClick={onBack} className="px-4 py-2 bg-gray-400 text-white rounded">Back</button>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginTop: '16px' }}>
        {groups.map((group) => (
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