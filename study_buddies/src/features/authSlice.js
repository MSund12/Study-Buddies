import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  // Initialize currentUser by trying to parse from localStorage
  currentUser: (() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || null;
    } catch (error) {
      console.error("Error reading user from localStorage:", error);
      localStorage.removeItem("user"); // Clear corrupted item
      localStorage.removeItem("token"); // Also clear token if user data is bad
      return null;
    }
  })(),
  // Add token state if you want to manage it in Redux too (optional)
  // token: localStorage.getItem('token') || null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      // Assuming action.payload is the user object
      state.currentUser = action.payload;
      localStorage.setItem("user", JSON.stringify(action.payload));
      // Note: Token itself is stored directly in SignIn.jsx using localStorage.setItem('token', ...)
      // If you wanted to store it in Redux state too:
      // state.token = action.payload.token; // Assumes token is passed alongside user in action payload
    },
    logout: (state) => {
      state.currentUser = null;
      // state.token = null; // Clear token from Redux state if managing it here
      localStorage.removeItem("user");
      // --- ADDED: Remove the token from localStorage ---
      localStorage.removeItem("token");
      // --- END ADDED ---
    },
    // Optional: Action to explicitly set token in Redux state if needed elsewhere
    // setToken: (state, action) => {
    //    state.token = action.payload;
    // }
  },
});

export const { loginSuccess, logout } = authSlice.actions;

export default authSlice.reducer;
