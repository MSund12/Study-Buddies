// src/pages/HomePage.jsx
import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../features/authSlice';
import { useNavigate } from 'react-router-dom'; // Keep useNavigate
import GroupFinderPage from './GroupFinderPage'; // Ensure paths are correct
import GroupPage from './GroupPage';           // Ensure paths are correct
import RedShape from './components/RedShape';
import PinkShape from './components/PinkShape';
import PurpleShape from './components/PurpleShape';
import './styles/HomePage.css';
import Header from '../Header';

// Define the courses in an array
const courses = ["EECS 2311", "ENG 2003", "MATH 2930"];

const HomePage = () => {
  const [showGroupFinder, setShowGroupFinder] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);

  const dispatch = useDispatch();
  const navigate = useNavigate(); // Get the navigate function
  const currentUser = useSelector((state) => state.auth.currentUser);

  // Handle logout (remains the same)
  const handleSignOut = () => {
    dispatch(logout());
    navigate('/signin');
  };

  // --- UPDATED handleCourseClick ---
  // Function to handle clicking on a course button
  const handleCourseClick = (courseTitle) => {
    // Replace all spaces globally with hyphens
    const courseSlug = courseTitle.replace(/ /g, '-');
    // Construct the path using the slug
    const path = `/courses/${courseSlug}`;
    console.log(`Navigating to: ${path}`); // For debugging
    navigate(path);
  };
  // --- END UPDATE ---

  // Conditional rendering for GroupPage/GroupFinderPage (ensure components are imported)
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
        // Pass props as needed
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
          <button className="signout-button" onClick={handleSignOut}>
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
         <a href="#" className="buttons" onClick={(e) => { e.preventDefault(); navigate('/group-finder'); }}>Study Groups</a>
         <a href="#" className="buttons" onClick={(e) => { e.preventDefault(); navigate('/chat'); }}>Chats</a>
         <a href="#" className="buttons" onClick={(e) => { e.preventDefault(); navigate('/schedule'); }}>Schedules</a>
         <a href="#" className="buttons" onClick={(e) => { e.preventDefault(); navigate('/book'); }}>Book a Room</a>
      </nav>

      {/* Search Bar */}
      <div className="search-container">
        <input type="text" placeholder="Search courses..." className="search-bar" />
      </div>

      {/* Course Display Area - uses updated handleCourseClick */}
      <div className="placeholder-container">
        {courses.map((title) => (
          <button
            key={title}
            className="placeholder-box"
            onClick={() => handleCourseClick(title)} // Calls the updated handler
          >
            {title}
          </button>
        ))}
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