import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async Thunk for fetching course data
export const fetchCourseData = createAsyncThunk(
  'courses/fetchCourseData',
  async ({ dept, courseId, term }, { rejectWithValue }) => {
    try {
      const response = await fetch(`http://localhost:5000/api/courses?dept=${dept}&courseId=${courseId}&term=${term}`);

      if (response.status === 404) {
        const data = await response.json();
        return rejectWithValue(data.message || 'Course not found.');
      }

      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        return data[0];
      } else {
        return rejectWithValue('Course not found.');
      }
    } catch (error) {
      return rejectWithValue('Error fetching course data.');
    }
  }
);

const courseSlice = createSlice({
  name: 'courses',
  initialState: {
    courseData: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearCourseData: (state) => {
      state.courseData = null;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCourseData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCourseData.fulfilled, (state, action) => {
        state.loading = false;
        state.courseData = action.payload;
        state.error = null;
      })
      .addCase(fetchCourseData.rejected, (state, action) => {
        state.loading = false;
        state.courseData = null;
        state.error = action.payload;
      });
  },
});

export const { clearCourseData } = courseSlice.actions;
export default courseSlice.reducer;
