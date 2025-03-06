import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import StarterPage from './pages/StarterPage';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Header from './Header';
import './App.css';


const App = () => {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  const handleRegister = (newUser) => {
    setUsers([...users, newUser]);
  };

  const handleLoginSuccess = (loggedInUser) => {
    setCurrentUser(loggedInUser);
  };


  return (
    <div className="app-container">
      <Header currentUser={currentUser} />
        <Routes>
          <Route path="/" element={currentUser ? <HomePage currentUser={currentUser} /> : <StarterPage />} />
          <Route path="/signin" element={<SignIn users={users} onLoginSuccess={handleLoginSuccess} />} />
          <Route path="/signup" element={<SignUp onRegister={handleRegister} />} />
          <Route path="*" element={<Navigate to="/" />} />
          <Route path="/home" element={<HomePage currentUser={currentUser} />} />
          <Route path="/starter" element={<StarterPage/>}/>
        </Routes>
    </div>
  );
};

export default App;
