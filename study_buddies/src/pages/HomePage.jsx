import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux'; // Import Redux hooks
import { logout } from '../features/authSlice'; // Import logout action
import { useNavigate } from 'react-router-dom'; // For redirection
import GroupFinderPage from './GroupFinderPage';
import GroupPage from './GroupPage';
import RedShape from './components/RedShape';
import PinkShape from './components/PinkShape';
import PurpleShape from './components/PurpleShape';
import './styles/HomePage.css'

const HomePage = () => {
  const [showGroupFinder, setShowGroupFinder] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);

  const dispatch = useDispatch(); // Redux dispatch
  const navigate = useNavigate(); // React Router navigation
  const currentUser = useSelector((state) => state.auth.currentUser);

  // Handle logout
  const handleSignOut = () => {
    dispatch(logout());
    navigate('/signin'); // Redirect to SignIn after logout
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
      <RedShape color="#1EE1A8" />
      <PinkShape />
      <PurpleShape />

      <nav className="buttons-container-home">
        <a href="#" className="buttons">Courses</a>
        <a href="#" className="buttons">Study Groups</a>

        {/* Navigate to Chat Page */}
        <a 
          href="#" 
          className="buttons" 
          onClick={(e) => {
            e.preventDefault(); // Prevent default anchor behavior
            navigate('/chat');
          }}
        >
          Chats
        </a>

        <a href="#" className="buttons">Empty Rooms</a>
        <a href="#" className="buttons">Book a Room</a>
      </nav>

      <div className="search-container">
        <input
          type="text"
          placeholder="Search courses..."
          className="search-bar"
        />
      </div>

      <div className="placeholder-container">
        <div className="placeholder-box">Placeholder 1</div>
        <div className="placeholder-box">Placeholder 2</div>
        <div className="placeholder-box">Placeholder 3</div>
        <div className="placeholder-box">Placeholder 4</div>
        <div className="placeholder-box">Placeholder 5</div>
        <div className="placeholder-box">Placeholder 6</div>
      </div>

      <button
        className="circular-button"
        onClick={() => navigate('/create-group')}  // Navigate to Create Group Page
      >
        Create a Group
      </button>

      {/* Sign Out Button */}
      {currentUser && (
        <button
          className="signout-button"
          style={{
            marginTop: '20px',
            backgroundColor: '#ff4d4d',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '20px',
            cursor: 'pointer'
          }}
          onClick={handleSignOut}
        >
          Sign Out
        </button>
      )}
    </div>
  );
};

export default HomePage;
