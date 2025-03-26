import React, { useState } from 'react';

function VerificationPage() {
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');

  const handleInputChange = (e) => {
    setCode(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (code === '123456') { //Temp input
      setMessage('Code verified successfully!');
    } else {
      setMessage('Invalid code. Please try again.');
    }
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Account Verification</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter verification code"
          value={code}
          onChange={handleInputChange}
        />
        <button type="submit">Verify</button>
      </form>
      <p>{message}</p>
    </div>
  );
}

export default VerificationPage;
