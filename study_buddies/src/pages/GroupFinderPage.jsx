import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchGroups } from '../features/groupSlice';
import { useNavigate } from 'react-router-dom';
import "./styles/GroupFinderPage.css"
import Header from '../Header';
import RedShape from './components/RedShape';
import PinkShape from './components/PinkShape';
import PurpleShape from './components/PurpleShape';



const GroupFinderPage = ({ onBack, onSelectGroup }) => {
  const currentUser = useSelector((state) => state.auth.currentUser);
  const [showGroupFinder, setShowGroupFinder] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { groups = [], loading, error } = useSelector((state) => state.groups); // Default groups to an empty array

  const [sortOrder, setSortOrder] = useState('asc');

  // Fetch groups when the page loads
  useEffect(() => {
    dispatch(fetchGroups());
  }, [dispatch]);

  const handleSignOut = () => {
      dispatch(logout());
      navigate('/starter');
    };

    if (selectedGroup) {
      return (
        <GroupPage
          group={selectedGroup}
          onBack={() => setSelectedGroup(null)}
          currentUser={currentUser}
        />
      );
    }
  
    if (showGroupFinder) {
      return (
        <GroupFinderPage
          onBack={() => setShowGroupFinder(false)}
          onSelectGroup={setSelectedGroup}
        />
      );
    }

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
    <div className="starter-container">
      <Header currentUser={currentUser} />
      {/* Sign Out Button in Top Right */}
      {currentUser && (
        <div className="signout-container">
          <button
            className="signout-button"
            onClick={handleSignOut}
          >
            Sign Out
          </button>
        </div>
      )}

      <RedShape color="#1EE1A8" />
      <PinkShape />
      <PurpleShape />

      <nav className="buttons-container-home">
        <a href="#" className="buttons">Courses</a>

        <a
          href="#"
          className="buttons"
          onClick={(e) => {
            e.preventDefault();
            navigate('/group-finder');
          }}
        >
          Study Groups
        </a>

        <a
          href="#"
          className="buttons"
          onClick={(e) => {
            e.preventDefault();
            navigate('/chat');
          }}
        >
          Chats
        </a>

        <a
          href="#"
          className="buttons"
          onClick={(e) => {
            e.preventDefault();
            navigate('/schedule');
          }}
        >
          Schedules
        </a>

        <a 
        href="#" 
        className="buttons"
        onClick={(e) => {e.preventDefault();
            navigate('/book')
        }}
        >Book a Room</a>
      </nav>
      {/* Sorting Controls */}
      <div className="sorting-controls">
        <label>Sort by Course Code:</label>
        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>
      </div>

      {/* Display Loading or Error States */}
      <div className='loading-message'>
        {loading && <p>Loading groups...</p>}
        {error && <p>{error}</p>}
      </div>

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
