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
    groups: [], // Ensure initial state is an array
    loading: false,
    error: null,
    successMessage: null,
    // Add pagination state if you plan to use it
    // totalGroups: 0,
    // totalPages: 0,
    // currentPage: 1,
  },
  reducers: {
    clearMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Create Group Cases (ensure push safety)
      .addCase(createGroup.pending, (state) => {
        state.loading = true; state.error = null; state.successMessage = null;
      })
      .addCase(createGroup.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload?.message;
        // Safety check: Ensure state.groups is an array before pushing
        if (Array.isArray(state.groups) && action.payload?.group) {
            state.groups.push(action.payload.group);
        } else {
            // Handle unexpected state - maybe replace state or log error
             console.error("Could not push group, state.groups is not an array or group missing:", state.groups, action.payload);
             // Fallback: If groups isn't an array, maybe initialize it with the new group
             // state.groups = action.payload?.group ? [action.payload.group] : [];
        }
      })
      .addCase(createGroup.rejected, (state, action) => {
        state.loading = false; state.error = action.payload;
      })

      // Fetch Groups Cases
      .addCase(fetchGroups.pending, (state) => {
        state.loading = true; state.error = null;
      })
      .addCase(fetchGroups.fulfilled, (state, action) => {
        state.loading = false;
        // --- CORRECTED REDUCER ---
        // Assign ONLY the groups array from the payload to state.groups
        state.groups = action.payload?.groups || []; // Use optional chaining and default to empty array
        // --- END CORRECTION ---

        // Optionally store pagination info from payload
        // state.totalGroups = action.payload?.totalGroups || 0;
        // state.totalPages = action.payload?.totalPages || 0;
        // state.currentPage = action.payload?.currentPage || 1;
      })
      .addCase(fetchGroups.rejected, (state, action) => {
        state.loading = false; state.error = action.payload;
      });
  },
});

export const { clearMessages } = groupSlice.actions;
export default groupSlice.reducer;