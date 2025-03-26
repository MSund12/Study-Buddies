import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector} from 'react-redux';
import RedShape from './components/RedShape';
import PinkShape from './components/PinkShape';
import PurpleShape from './components/PurpleShape';
import "./styles/Verify.css";
import Header from '../Header';

const VerifyPage = () => {
  const currentUser = useSelector((state) => state.auth.currentUser);
  const [formData, setFormData] = useState({
    email: '',
    verificationCode: '',
  });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  // Update the state for each input field
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle form submission: post to the /verify endpoint
  const handleVerify = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:5000/api/users/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();

      if (response.ok) {
        setMessage('Verification successful!');
        // Optionally, navigate the user to home or login after a short delay
        setTimeout(() => {
          navigate('/signin'); // Or use '/login' if that makes more sense
        }, 1500);
      } else {
        setMessage(data.message || 'Verification failed');
      }
    } catch (error) {
      setMessage('Error connecting to server');
    }
  };

  return (
    <div className="starter-container">
      <Header currentUser={currentUser} />
      <RedShape/>
      <PinkShape/>
      <PurpleShape/>
      <h2 className='title'>Verify Your Account</h2>
      <form onSubmit={handleVerify} className='form' >
        <div className="email-input">
          <label htmlFor="email">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="Enter your email address"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className='code-input'>
          <label htmlFor="verificationCode" style={{ display: 'block', marginBottom: '5px' }}>
            Verification Code
          </label>
          <input
            type="text"
            id="verificationCode"
            name="verificationCode"
            placeholder="Enter the verification code"
            value={formData.verificationCode}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit">
          Verify Account
        </button>
      </form>
      {message && <p className='errorMessage'>{message}</p>}
    </div>
  );
};

export default VerifyPage;
