// features/groupSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// Using axios as per previous examples, ensure it's installed and imported
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// createGroup thunk (remains unauthenticated as per previous step)
export const createGroup = createAsyncThunk(
  'groups/createGroup',
  async (groupData, { rejectWithValue }) => {
    try {
      const config = { headers: { 'Content-Type': 'application/json' } };
      const response = await axios.post(`${API_BASE_URL}/groups/create`, groupData, config);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to create group';
      console.error("Create Group Thunk Error:", error.response?.data || error);
      return rejectWithValue(message);
    }
  }
);

// fetchGroups thunk (Corrected Signature + Unauthenticated)
export const fetchGroups = createAsyncThunk(
  'groups/fetchGroups',
  // --- CORRECTED: Accept filterParams ---
  async (filterParams = {}, { rejectWithValue }) => {
    try {
      const config = {
        // No Authorization header needed since we reverted auth
        params: filterParams // Pass filters (like { course: '...' }) as query params
      };
      const response = await axios.get(`${API_BASE_URL}/groups`, config);
      // Return the full response object { groups: [], totalGroups: X, ... }
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch groups';
      console.error("Fetch Groups Thunk Error:", error.response?.data || error);
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
    // Ensure these are defined in initial state
    totalGroups: 0,
    totalPages: 0,
    currentPage: 1,
  },
  reducers: {
     // ... clearMessages ...
  },
  extraReducers: (builder) => {
    builder
      // ... createGroup cases ...

      // Fetch Groups Cases
      .addCase(fetchGroups.pending, (state) => {
        state.loading = true; state.error = null;
      })
      .addCase(fetchGroups.fulfilled, (state, action) => {
        // ***** ADD LOGS *****
        console.log('--- fetchGroups Fulfilled Reducer ---');
        // Log the entire payload received from the thunk
        console.log('Received action.payload:', JSON.stringify(action.payload, null, 2));
        // Log state *before* changes
        console.log('State BEFORE update:', JSON.stringify(state));
        // ***** END LOGS *****

        state.loading = false;
        state.groups = action.payload?.groups || [];
        state.totalGroups = action.payload?.totalGroups || 0;
        state.totalPages = action.payload?.totalPages || 0; // Assign totalPages
        state.currentPage = action.payload?.currentPage || 1; // Assign currentPage

        // ***** ADD LOG *****
        // Log state *after* changes
        console.log('State AFTER update:', JSON.stringify(state));
        // ***** END LOG *****
      })
      .addCase(fetchGroups.rejected, (state, action) => {
        // ... (error handling) ...
      });
  },
});

export const { clearMessages } = groupSlice.actions;
export default groupSlice.reducer;