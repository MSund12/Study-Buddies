import React, { useState } from 'react';
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import './App.css'
import {Routes, Route, Navigate} from 'react-router-dom';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';

const App = () => {
  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState('register');

  const handleRegister = (newUser) => {
    setUsers([...users, newUser]);
    setCurrentPage('login');
  };

  const handleLoginSuccess = () => {
    setCurrentPage('home');
  };

  return (
    <div>
      {currentPage === 'register' && <RegisterPage onRegister={handleRegister} />}
      {currentPage === 'login' && <LoginPage users={users} onLoginSuccess={handleLoginSuccess} />}
      {currentPage === 'home' && <HomePage />}
    </div>
  );
};

export default App;
