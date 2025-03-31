// features/groupSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios'; // Using axios

const API_BASE_URL = 'http://localhost:5000/api';

// Async Thunk for Creating Groups (Unauthenticated Version)
export const createGroup = createAsyncThunk(
  'groups/createGroup',
  async (groupData, { rejectWithValue }) => {
    try {
      const config = { headers: { 'Content-Type': 'application/json' } };
      // Making unauthenticated request as per previous step
      const response = await axios.post(`${API_BASE_URL}/groups/create`, groupData, config);
      return response.data; // Contains { message, group }
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to create group';
      console.error("Create Group Thunk Error:", error.response?.data || error); // Keep essential error log
      return rejectWithValue(message);
    }
  }
);

// Async Thunk for Fetching Groups (Accepts filterParams, Unauthenticated Version)
export const fetchGroups = createAsyncThunk(
  'groups/fetchGroups',
  async (filterParams = {}, { rejectWithValue }) => {
    try {
      const config = {
        params: filterParams // Pass filters like { course: '...' }
        // No Authorization header needed for unauthenticated version
      };
      // console.log(`[fetchGroups Thunk] Requesting ${API_BASE_URL}/groups with config:`, config); // Debug log removed
      const response = await axios.get(`${API_BASE_URL}/groups`, config);
      // console.log("[fetchGroups Thunk] Success Response Data:", response.data); // Debug log removed
      return response.data; // Returns { totalGroups, totalPages, currentPage, groups }
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch groups';
      console.error("Fetch Groups Thunk Error:", error.response?.data || error); // Keep essential error log
      return rejectWithValue(message);
    }
  }
);

// --- Slice Definition ---
const groupSlice = createSlice({
  name: 'groups',
  initialState: {
    groups: [],
    loading: false,
    error: null,
    successMessage: null,
    totalGroups: 0,
    totalPages: 0,
    currentPage: 1,
  },
  reducers: {
    clearMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    }
    // Removed dummyAction if added previously
  },
  extraReducers: (builder) => {
    builder
      // Create Group Cases
      .addCase(createGroup.pending, (state) => {
        state.loading = true; state.error = null; state.successMessage = null;
      })
      .addCase(createGroup.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload?.message;
        if (Array.isArray(state.groups) && action.payload?.group) { // Safety check
            state.groups.push(action.payload.group);
        }
      })
      .addCase(createGroup.rejected, (state, action) => {
        state.loading = false; state.error = action.payload;
      })

      // Fetch Groups Cases
      .addCase(fetchGroups.pending, (state) => {
        // console.log('[fetchGroups Reducer] Pending...'); // Debug log removed
        state.loading = true; state.error = null;
      })
      .addCase(fetchGroups.fulfilled, (state, action) => {
        // console.log('[fetchGroups Reducer] Fulfilled. Payload:', action.payload); // Debug log removed
        state.loading = false;
        state.groups = action.payload?.groups || []; // Correctly assign groups array
        state.totalGroups = action.payload?.totalGroups || 0;
        state.totalPages = action.payload?.totalPages || 0;
        state.currentPage = action.payload?.currentPage || 1;
        // console.log('[fetchGroups Reducer] State Updated:', { totalPages: state.totalPages }); // Debug log removed
      })
      .addCase(fetchGroups.rejected, (state, action) => {
        // console.log('[fetchGroups Reducer] Rejected. Payload (Error):', action.payload); // Debug log removed
        state.loading = false; state.error = action.payload;
        state.groups = []; state.totalGroups = 0; state.totalPages = 0; state.currentPage = 1; // Reset on error
      });
  },
});

// Removed log before export

export const { clearMessages } = groupSlice.actions; // Export the action creator
export default groupSlice.reducer; // Export the reducer