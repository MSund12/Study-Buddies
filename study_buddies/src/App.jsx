import React, { useState } from 'react';
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import './App.css'
import {Routes, Route, Navigate} from 'react-router-dom';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';

const App = () => {
  //Our stub "database" for registered users
  const [users, setUsers] = useState([]);
  //Holds the current logged-in user.
  const [currentUser, setCurrentUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('register');

  const handleRegister = (newUser) => {
    setUsers([...users, newUser]);
    setCurrentPage('login');
  };

  const handleLoginSuccess = (loggedInUser) => {
    setCurrentUser(loggedInUser);
    setCurrentPage('home');
  };

  return (
    <div>
      {currentPage === 'register' && <RegisterPage onRegister={handleRegister} />}
      {currentPage === 'login' && (
        <LoginPage users={users} onLoginSuccess={handleLoginSuccess} />
      )}
      {currentPage === 'home' && <HomePage currentUser={currentUser} />}
    </div>
  );
};

export default App;
