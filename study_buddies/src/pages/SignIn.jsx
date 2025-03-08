import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RedShape from './components/RedShape';
import PurpleShape from './components/PurpleShape';
import PinkShape from './components/PinkShape';

const SignIn = ({ users, onLoginSuccess }) => {
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
  
    try {
      const response = await fetch('http://localhost:5000/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
  
        if (data.user.isAdmin) {
          navigate('/home'); // Redirect admins to admin panel
        } else {
          navigate('/home');
        }
      } else {
        setMessage(data.message || 'Login failed');
      }
    } catch (error) {
      setMessage('Error connecting to server');
    }
  };
  

  return (
    <div className="starter-container">
      <RedShape color="#44A944"/>
      <PurpleShape color="#473C60" />
      <PinkShape color="#0000FF"/>
      <h2 className="login-title">Log In</h2>

      <form onSubmit={handleLogin} className="login-form">
        {/* Email Input */}
        <label htmlFor="email" className="login-label">School Email</label>
        <input
          type="email"
          id="email"
          placeholder="Enter your school email"
          value={loginData.email}
          onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
          className="login-input"
          required
        />

        {/* Password Input */}
        <label htmlFor="password" className="login-label">Password</label>
        <input
          type="password"
          id="password"
          placeholder="Enter your password"
          value={loginData.password}
          onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
          className="login-input"
          required
        />

        {/* Login Button */}
        <button type="submit" className="login-button">Log In</button>
      </form>

      {message && <p className="error-message">{message}</p>}
    </div>
  );
};

export default SignIn;
