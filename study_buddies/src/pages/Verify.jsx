import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const VerifyPage = () => {
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
          navigate('/home'); // Or use '/login' if that makes more sense
        }, 1500);
      } else {
        setMessage(data.message || 'Verification failed');
      }
    } catch (error) {
      setMessage('Error connecting to server');
    }
  };

  return (
    <div className="verify-container" style={{ textAlign: 'center', marginTop: '50px' }}>
      <h2>Verify Your Account</h2>
      <form onSubmit={handleVerify} style={{ maxWidth: '400px', margin: '0 auto' }}>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="email" style={{ display: 'block', marginBottom: '5px' }}>
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
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
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
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        <button type="submit" style={{ padding: '10px 20px' }}>
          Verify Account
        </button>
      </form>
      {message && <p style={{ marginTop: '20px', color: 'green' }}>{message}</p>}
    </div>
  );
};

export default VerifyPage;
