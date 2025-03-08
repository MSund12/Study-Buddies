import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import StarterPage from './pages/StarterPage';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Header from './Header';
import SchedulePage from './pages/SchedulePage';
import './App.css';
import GroupChatSidebar from './pages/GroupChatSidebar';

const App = () => {
  const [currentUser, setCurrentUser] = useState(null);

  // Load user from localStorage on initial render
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLoginSuccess = (loggedInUser) => {
    setCurrentUser(loggedInUser);
    localStorage.setItem('user', JSON.stringify(loggedInUser)); // Persist user
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('user'); // Clear user on logout
    localStorage.removeItem('token');
  };

  return (
      <div className="app-container">
        <Header currentUser={currentUser} />
        <Routes>
          <Route path="/" element={currentUser ? <HomePage currentUser={currentUser} /> : <StarterPage />} />
          <Route path="/signin" element={<SignIn onLoginSuccess={handleLoginSuccess} />} />
          <Route path="/schedule" element={<SchedulePage currentUser={currentUser} />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/home" element={<HomePage currentUser={currentUser} />} />
          <Route path="/chat" element={<GroupChatSidebar currentUser={currentUser} />} />
          <Route path="/starter" element={<StarterPage />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
  );
};

export default App;
