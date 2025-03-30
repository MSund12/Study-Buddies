import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../features/authSlice';
import { useNavigate } from 'react-router-dom';
import GroupFinderPage from './GroupFinderPage';
import GroupPage from './GroupPage';
import RedShape from './components/RedShape';
import PinkShape from './components/PinkShape';
import PurpleShape from './components/PurpleShape';
import './styles/HomePage.css'; // Ensure CSS is imported
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

  // Conditional rendering based on selectedGroup or showGroupFinder (remains the same)
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

  // Main HomePage render
  return (
    <div className="starter-container">
      <Header currentUser={currentUser} />
      {/* Sign Out Button */}
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

      {/* Decorative Shapes */}
      <RedShape color="#1EE1A8" />
      <PinkShape />
      <PurpleShape />

      {/* Navigation Buttons */}
      <nav className="buttons-container-home">
        <a href="#" className="buttons">Courses</a>
        <a href="#" className="buttons" onClick={(e) => { e.preventDefault(); navigate('/group-finder'); }}>
          Study Groups
        </a>
        <a href="#" className="buttons" onClick={(e) => { e.preventDefault(); navigate('/chat'); }}>
          Chats
        </a>
        <a href="#" className="buttons" onClick={(e) => { e.preventDefault(); navigate('/schedule'); }}>
          Schedules
        </a>
        <a href="#" className="buttons" onClick={(e) => { e.preventDefault(); navigate('/book'); }}>
          Book a Room
        </a>
      </nav>

      {/* Search Bar */}
      <div className="search-container">
        <input
          type="text"
          placeholder="Search courses..."
          className="search-bar"
          // Add state and onChange handler here if search needs to be functional
        />
      </div>

      {/* Course Display Area - UPDATED */}
      <div className="placeholder-container">
        {/* Replace the old placeholders with the specified courses */}
        <div className="placeholder-box">EECS 2311</div>
        <div className="placeholder-box">ENG 2003</div>
        <div className="placeholder-box">MATH 2930</div>
        {/* Removed the other placeholders */}
      </div>

      {/* Create Group Button */}
      <button
        className="circular-button"
        onClick={() => navigate('/create-group')}
      >
        Create a Group
      </button>
    </div>
  );
};

export default HomePage;