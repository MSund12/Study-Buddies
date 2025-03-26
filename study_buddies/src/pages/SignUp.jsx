import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useSelector} from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginSuccess } from '../features/authSlice'; // Import Redux action
import RedShape from './components/RedShape';
import PurpleShape from './components/PurpleShape';
import PinkShape from './components/PinkShape';
import Header from '../Header';
import "./styles/SignUp.css"

const SignUp = () => {
  const currentUser = useSelector((state) => state.auth.currentUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  });
  const [message, setMessage] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();

    const emailRegex = /@(yorku\.ca|my\.yorku\.ca)$/;

    if (!emailRegex.test(formData.email)) {
      setMessage('Email must end with @yorku.ca or @my.yorku.ca');
      return;
    }

    // Password must be at least 8 characters long,
    // contain at least one uppercase letter, one lowercase letter, and one special character.
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/;
    if (!passwordRegex.test(formData.password)) {
      setMessage(
        'Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, and one special character.'
      );
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("Please check email for your verification code");
        navigate('/verify'); // Redirect to homepage
      } else {
        setMessage(data.message || 'Registration failed');
      }
    } catch (error) {
      setMessage('Error connecting to server');
    }
  };

  return (
    <div className="starter-container">
      <Header currentUser={currentUser} />
      <RedShape color="#FF7700" />
      <PurpleShape color="#F1ED76"/>
      <PinkShape color="#EC326D"/>

      <h2 className="signup-title">Create your account</h2>

      <form onSubmit={handleRegister} className="signup-form">
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

        <p className="password-warning">
          Please Select a<br/>Password Different<br/>From Passport York
        </p>

        <button type="submit" className="signup-button">Create an account</button>
      </form>

      {message && <p className="success-message">{message}</p>}
    </div>
  );
};

export default SignUp;
