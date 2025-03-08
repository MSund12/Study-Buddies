import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RedShape from './components/RedShape';
import PurpleShape from './components/PurpleShape';
import PinkShape from './components/PinkShape';

const SignUp = ({ onRegister }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
  
    try {
      const response = await fetch('http://localhost:5000/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        setMessage('Registration successful! Redirecting...');
        setTimeout(() => navigate('/signin'), 1500);
      } else {
        setMessage(data.message || 'Registration failed');
      }
    } catch (error) {
      setMessage('Error connecting to server');
    }
  };
  

  return (
    <div className="starter-container">
      <RedShape color="#FF7700" />
      <PurpleShape color="#F1ED76"/>
      <PinkShape color="#EC326D"/>

      <h2 className="signup-title">Create your account</h2>

      <form onSubmit={handleRegister} className="signup-form">
        {/* First Name & Last Name - Side by Side */}
        <div className="signup-row">
          <div className="input-group">
            <label htmlFor="firstName">First Name</label>
            <input
              type="text"
              id="firstName"
              placeholder="First Name"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="lastName">Last Name</label>
            <input
              type="text"
              id="lastName"
              placeholder="Last Name"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              required
            />
          </div>
        </div>

        {/* School Email Address */}
        <div className="input-group2">
          <label htmlFor="email">School Email Address</label>
          <input
            type="email"
            id="email"
            placeholder="School Email Address"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
        </div>

        {/* Password Field */}
        <div className="input-group2">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />
        </div>

        {/* Password Warning (Right-Aligned in Red) */}
        <p className="password-warning">Please Select a<br/>Password Different<br/>From Passport York</p>

        {/* Sign Up Button */}
        <button type="submit" className="signup-button">Create an account</button>
      </form>

      {message && <p className="success-message">{message}</p>}
    </div>
  );
};

export default SignUp;
