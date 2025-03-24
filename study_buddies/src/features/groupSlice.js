import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// 🔹 Async Thunk for Creating Groups
export const createGroup = createAsyncThunk(
  'groups/createGroup',
  async (groupData, { rejectWithValue }) => {
    try {
      const response = await fetch('http://localhost:5000/api/groups/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(groupData),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to create group.');
      }

      return data;
    } catch (error) {
      return rejectWithValue('Error connecting to server.');
    }
  }
);

// 🔹 Async Thunk for Fetching Groups
export const fetchGroups = createAsyncThunk(
  'groups/fetchGroups',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('http://localhost:5000/api/groups');
      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to fetch groups.');
      }

      return data;
    } catch (error) {
      return rejectWithValue('Error connecting to server.');
    }
  }
);

const groupSlice = createSlice({
  name: 'groups',
  initialState: {
    groups: [],
    loading: false,
    error: null,
    successMessage: null,
  },
  reducers: {
    // 🔹 Clear success and error messages
    clearMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // ➤ Create Group Actions
      .addCase(createGroup.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(createGroup.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload.message;
        state.groups.push(action.payload.group); // Add new group to the state
      })
      .addCase(createGroup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ➤ Fetch Groups Actions
      .addCase(fetchGroups.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGroups.fulfilled, (state, action) => {
        state.loading = false;
        state.groups = action.payload; // Store fetched groups in state
      })
      .addCase(fetchGroups.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// 🔹 Ensure clearMessages and fetchGroups are exported correctly
export const { clearMessages } = groupSlice.actions;
export default groupSlice.reducer;
