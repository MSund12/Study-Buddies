import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginSuccess } from '../features/authSlice'; // Import Redux action
import { useSelector } from 'react-redux';
import RedShape from './components/RedShape';
import PurpleShape from './components/PurpleShape';
import PinkShape from './components/PinkShape';
import Header from '../Header';
import "./styles/SignIn.css"

const SignIn = () => {
  const currentUser = useSelector((state) => state.auth.currentUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [message, setMessage] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:5000/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        dispatch(loginSuccess(data.user)); // Update Redux store with logged-in user
        navigate('/home'); // Redirect to homepage
      } else {
        setMessage(data.message || 'Login failed');
      }
    } catch (error) {
      setMessage('Error connecting to server');
    }
  };

  return (
    <div className="starter-container">
      <Header currentUser={currentUser} />
      <RedShape color="#44A944"/>
      <PurpleShape color="#473C60"/>
      <PinkShape color="#0000FF"/>

      <h2 className="signin-title">Welcome <span>Back!</span></h2>

      <form onSubmit={handleLogin} className="signin-form">
        <div className="signin-group">
          <label htmlFor="email">Email Address</label>
          <input
            type="email"
            id="email"
            placeholder="Your Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
        </div>

        <div className="signin-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            placeholder="Your Password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />
        </div>

        <button type="submit" className="signin-button">Sign In</button>
      </form>

      {message && <p className="error-message">{message}</p>}
    </div>
  );
};

export default SignIn;
