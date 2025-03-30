// features/authSlice.js
import { createSlice } from '@reduxjs/toolkit';

// Add token to initial state, try loading from localStorage
const initialState = {
  currentUser: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null, // <-- Add token state
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      // Expect payload to be an object like { user: ..., token: ... }
      state.currentUser = action.payload.user;
      state.token = action.payload.token; // <-- Store the token in state
      // Store both in localStorage
      localStorage.setItem('user', JSON.stringify(action.payload.user));
      localStorage.setItem('token', action.payload.token); // <-- Store token in localStorage
    },
    logout: (state) => {
      state.currentUser = null;
      state.token = null; // <-- Clear token from state
      localStorage.removeItem('user');
      localStorage.removeItem('token'); // Keep this line
    },
  },
});

export const { loginSuccess, logout } = authSlice.actions;

export default authSlice.reducer;