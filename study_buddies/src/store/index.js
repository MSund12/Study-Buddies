import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/authSlice';
import courseReducer from '../features/courseSlice';
import groupReducer from '../features/groupSlice';  // Import groupSlice

export const store = configureStore({
  reducer: {
    auth: authReducer,
    courses: courseReducer,
    groups: groupReducer,
  },
});
