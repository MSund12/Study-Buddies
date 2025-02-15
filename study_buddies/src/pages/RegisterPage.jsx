import React, { useState } from 'react';

const RegisterPage = ({ onRegister }) => {
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });

    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        // try {
        //     const response = await fetch('http://localhost:5000/api/users/register',{
        //         method: 'POST',
        //         headers: {
        //             'Content-Type': 'application/json',
        //         },
        //         body: JSON.stringify(formData),
        //     });
        //     const data = await response.json();
        //     if (response.ok) {
        //         setMessage('Registration successful');

        //     } else {
        //         setMessage(data.message || 'Registration failed');
        //     }
        // } catch (error) {
        //     setMessage('Error connecting to server');
        // }

        if (formData.username && formData.password) {
            
            onRegister(formData);
            setMessage(`Registration successful for ${formData.username}!`);
            
            setFormData({ username: '', password: '' });
          } else {
            setMessage('Please fill out all fields.');
          }
    };

        return (
            <div>
                <h2>Register</h2>
                <form onSubmit={handleSubmit}>
                    <input
                    type="text"
                    placeholder="Username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value})}
                    />
                    <input
                    type="password"
                    placeholder='Password'
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value})}
                    />
                    <button type="submit">Register</button>
                    </form>
                    {message && <p>{message}</p>}
            </div>
        );
    };
    export default RegisterPage;