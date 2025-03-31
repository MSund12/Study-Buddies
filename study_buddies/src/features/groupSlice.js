// features/groupSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// createGroup thunk (unauthenticated version)
export const createGroup = createAsyncThunk( /* ... as before ... */ );

// fetchGroups thunk (unauthenticated version with logging)
export const fetchGroups = createAsyncThunk(
  'groups/fetchGroups',
  async (filterParams = {}, { rejectWithValue }) => {
    // --- THUNK LOG ---
    console.log('[fetchGroups Thunk] Starting. Params:', filterParams);
    try {
      const config = { params: filterParams };
      // --- THUNK LOG ---
      console.log(`[fetchGroups Thunk] Requesting ${API_BASE_URL}/groups with config:`, config);
      const response = await axios.get(`${API_BASE_URL}/groups`, config);
      // --- THUNK LOG ---
      console.log("[fetchGroups Thunk] Success Response Data:", response.data);
      return response.data; // Return the full response object
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch groups';
      // --- THUNK LOG ---
      console.error("[fetchGroups Thunk] Error:", error.response?.data || error);
      return rejectWithValue(message);
    }
  }
);

// --- Slice Definition ---
const groupSlice = createSlice({
  name: 'groups',
  initialState: {
    groups: [], loading: false, error: null, successMessage: null,
    totalGroups: 0, totalPages: 0, currentPage: 1, // Ensure defaults are here
  },
  reducers: { /* ... clearMessages ... */ },
  extraReducers: (builder) => {
    builder
      // ... createGroup cases ...

      // --- Fetch Groups Cases with Logging ---
      .addCase(fetchGroups.pending, (state) => {
        console.log('[fetchGroups Reducer] Pending...'); // <-- LOG
        state.loading = true; state.error = null;
      })
      .addCase(fetchGroups.fulfilled, (state, action) => {
        console.log('[fetchGroups Reducer] Fulfilled. Payload:', action.payload); // <-- LOG
        state.loading = false;
        state.groups = action.payload?.groups || [];
        state.totalGroups = action.payload?.totalGroups || 0;
        state.totalPages = action.payload?.totalPages || 0;
        state.currentPage = action.payload?.currentPage || 1;
        console.log('[fetchGroups Reducer] State Updated:', { totalPages: state.totalPages, currentPage: state.currentPage, groupsCount: state.groups.length }); // <-- LOG
      })
      .addCase(fetchGroups.rejected, (state, action) => {
        console.log('[fetchGroups Reducer] Rejected. Payload (Error):', action.payload); // <-- LOG
        state.loading = false;
        state.error = action.payload;
        // Reset state on rejection
        state.groups = [];
        state.totalGroups = 0;
        state.totalPages = 0;
        state.currentPage = 1;
      });
      // --- End Fetch Groups Cases ---
  },
});

export const { clearMessages } = groupSlice.actions;
export default groupSlice.reducer;