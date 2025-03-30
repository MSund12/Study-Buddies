// features/authSlice.js
import { createSlice } from '@reduxjs/toolkit';

// Function to safely parse JSON from localStorage
const safeJsonParse = (key) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error(`Error reading or parsing ${key} from localStorage:`, error);
    localStorage.removeItem(key); // Clear corrupted item
    // Also clear associated items if one part is corrupted
    if (key === 'user') {
         localStorage.removeItem('token');
    } else if (key === 'token'){
         localStorage.removeItem('user');
    }
    return null;
  }
};

// Initialize state by safely reading from localStorage
const initialState = {
  currentUser: safeJsonParse('user') || null, // Safely parse user
  token: localStorage.getItem('token') || null, // Get token (plain string, no parse needed)
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Expects action.payload to be { user: Object, token: string }
    loginSuccess: (state, action) => {
      // Ensure payload structure is correct before updating
      if (action.payload && action.payload.user && action.payload.token) {
          state.currentUser = action.payload.user;
          state.token = action.payload.token;
          // Store in localStorage
          localStorage.setItem('user', JSON.stringify(action.payload.user));
          localStorage.setItem('token', action.payload.token);
      } else {
          // Log an error if payload is incorrect - helps debugging
          console.error("loginSuccess action received invalid payload:", action.payload);
      }
    },
    // Clears both state and localStorage
    logout: (state) => {
      state.currentUser = null;
      state.token = null; // Clear token from state
      localStorage.removeItem('user');
      localStorage.removeItem('token'); // Clear from storage
    },
  },
});

export const { loginSuccess, logout } = authSlice.actions;

export default authSlice.reducer;