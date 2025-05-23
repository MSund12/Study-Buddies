import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginSuccess, logout } from './features/authSlice';

import HomePage from './pages/HomePage';
import StarterPage from './pages/StarterPage';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import BookRoom from './pages/BookRoom';
import Verify from './pages/Verify';
import Header from './Header';


import SchedulePage from './pages/SchedulePage';
import './App.css';
import CreateGroupPage from './pages/CreateGroupPage';
import GroupChatSidebar from './pages/GroupChatSidebar';
import GroupFinderPage from './pages/GroupFinderPage';
import CoursePage from './pages/CoursePage';
import { current } from '@reduxjs/toolkit';

const App = () => {
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.auth.currentUser);

  const handleLoginSuccess = (loggedInUser) => {
    dispatch(loginSuccess(loggedInUser));
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <div className="app-container">
      <Routes>
        <Route path="/" element={currentUser ? <HomePage currentUser={currentUser} /> : <StarterPage />} />
        <Route path="/signin" element={<SignIn onLoginSuccess={handleLoginSuccess} />} />
        <Route path="/schedule" element={<SchedulePage currentUser={currentUser} />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/verify" element={<Verify />} />
        <Route path="/home" element={<HomePage currentUser={currentUser} />} />
        <Route path="/chat" element={<GroupChatSidebar currentUser={currentUser} />} />
        <Route path="/starter" element={<StarterPage />} />
        <Route path="/create-group" element={<CreateGroupPage />} />
        <Route path="/group-finder" element={<GroupFinderPage />} />
        <Route path="/book" element={<BookRoom currentUser={currentUser}/>}/>

        <Route path="/courses/:courseSlug" element={<CoursePage />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
};

export default App;
