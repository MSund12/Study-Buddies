import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../features/authSlice';
import { useNavigate } from 'react-router-dom';
import GroupFinderPage from './GroupFinderPage';
import GroupPage from './GroupPage';
import RedShape from './components/RedShape';
import PinkShape from './components/PinkShape';
import PurpleShape from './components/PurpleShape';
import './styles/HomePage.css';
import Header from '../Header';

const HomePage = () => {
  const [showGroupFinder, setShowGroupFinder] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const currentUser = useSelector((state) => state.auth.currentUser);

  // Handle logout
  const handleSignOut = () => {
    dispatch(logout());
    navigate('/signin');
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


    
    </div>
  );
};

export default HomePage;
