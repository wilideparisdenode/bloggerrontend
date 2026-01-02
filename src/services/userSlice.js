import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { API } from './api';

// Async thunks for user operations
export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await API.getAllUsers();
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchUserById = createAsyncThunk(
  'users/fetchUserById',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await API.getUserById(userId);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  'users/updateUserProfile',
  async ({ userId, userData }, { rejectWithValue }) => {
    try {
      const response = await API.updateUser(userId, userData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const changeUserPassword = createAsyncThunk(
  'users/changeUserPassword',
  async ({ userId, passwordData }, { rejectWithValue }) => {
    try {
      const response = await API.changePassword(userId, passwordData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const userSlice = createSlice({
  name: 'users',
  initialState: {
    users: [],
    currentUser: null,
    loading: false,
    error: null
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentUser: (state) => {
      state.currentUser = null;
    },
    setCurrentUser: (state, action) => {
      state.currentUser = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch users
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.users || [];
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch user by ID
      .addCase(fetchUserById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload;
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update user profile
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        const updatedUser = action.payload.user;
        const index = state.users.findIndex(
          user => user._id === updatedUser.id
        );
        if (index !== -1) {
          state.users[index] = updatedUser;
        }
        if (state.currentUser?._id === updatedUser.id) {
          state.currentUser = updatedUser;
        }
      })
      // Change password
      .addCase(changeUserPassword.fulfilled, (state) => {
        // Password change doesn't update user data
        state.error = null;
      })
      .addCase(changeUserPassword.rejected, (state, action) => {
        state.error = action.payload;
      });
  }
});

export const { clearError, clearCurrentUser, setCurrentUser } = userSlice.actions;
export default userSlice.reducer;


