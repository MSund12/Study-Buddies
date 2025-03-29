import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async Thunk to Fetch Messages
export const fetchMessages = createAsyncThunk(
  'chats/fetchMessages',
  async ({ sender, receiver, chatId }, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/chats?sender=${sender}&receiver=${receiver}&chatId=${chatId}`
      );
      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to fetch messages.');
      }

      return data; // Return the list of messages from the response
    } catch (error) {
      return rejectWithValue('Error connecting to the server.');
    }
  }
);

// Async Thunk to Send Message
export const sendMessage = createAsyncThunk(
  'chats/sendMessage',
  async ({ sender, receiver, message, chatId }, { rejectWithValue }) => {
    try {
      const response = await fetch('http://localhost:5000/api/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sender, receiver, message, chatId }),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to send message.');
      }

      return data; // Return the sent message details
    } catch (error) {
      return rejectWithValue('Error sending message.');
    }
  }
);

const chatSlice = createSlice({
  name: 'chats',
  initialState: {
    messages: [], // Initialize messages as an empty array
    status: 'idle', // The status can be 'idle', 'loading', 'succeeded', or 'failed'
    error: null, // Error message will be stored here
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Messages Actions
      .addCase(fetchMessages.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.messages = action.payload; // Set the messages from the response
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload; // Set error from rejection
      })
      // Send Message Actions
      .addCase(sendMessage.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // Optionally, you could add the message to the state here if it's successful
        state.messages.push(action.payload); // Add the new message to the list
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload; // Set error from rejection
      });
  },
});

// Export the slice reducer
export default chatSlice.reducer;
