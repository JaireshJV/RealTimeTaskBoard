import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Helper function to get auth headers
const getAuthHeaders = (getState) => ({
  Authorization: `Bearer ${getState().auth.token}`
});

// Async thunks
export const fetchWorkspaces = createAsyncThunk(
  'workspace/fetchWorkspaces',
  async (_, { rejectWithValue, getState }) => {
    try {
      const response = await axios.get(`${API_URL}/workspaces`, {
        headers: getAuthHeaders(getState)
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch workspaces');
    }
  }
);

export const createWorkspace = createAsyncThunk(
  'workspace/createWorkspace',
  async (workspaceData, { rejectWithValue, getState }) => {
    try {
      const response = await axios.post(`${API_URL}/workspaces`, workspaceData, {
        headers: getAuthHeaders(getState)
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to create workspace');
    }
  }
);

export const fetchWorkspace = createAsyncThunk(
  'workspace/fetchWorkspace',
  async (workspaceId, { rejectWithValue, getState }) => {
    try {
      const response = await axios.get(`${API_URL}/workspaces/${workspaceId}`, {
        headers: getAuthHeaders(getState)
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch workspace');
    }
  }
);

export const updateWorkspace = createAsyncThunk(
  'workspace/updateWorkspace',
  async ({ workspaceId, updateData }, { rejectWithValue, getState }) => {
    try {
      const response = await axios.put(`${API_URL}/workspaces/${workspaceId}`, updateData, {
        headers: getAuthHeaders(getState)
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to update workspace');
    }
  }
);

export const deleteWorkspace = createAsyncThunk(
  'workspace/deleteWorkspace',
  async (workspaceId, { rejectWithValue, getState }) => {
    try {
      await axios.delete(`${API_URL}/workspaces/${workspaceId}`, {
        headers: getAuthHeaders(getState)
      });
      return workspaceId;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to delete workspace');
    }
  }
);

export const addWorkspaceMember = createAsyncThunk(
  'workspace/addMember',
  async ({ workspaceId, memberData }, { rejectWithValue, getState }) => {
    try {
      const response = await axios.post(`${API_URL}/workspaces/${workspaceId}/members`, memberData, {
        headers: getAuthHeaders(getState)
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to add member');
    }
  }
);

export const removeWorkspaceMember = createAsyncThunk(
  'workspace/removeMember',
  async ({ workspaceId, userId }, { rejectWithValue, getState }) => {
    try {
      const response = await axios.delete(`${API_URL}/workspaces/${workspaceId}/members/${userId}`, {
        headers: getAuthHeaders(getState)
      });
      return { workspaceId, userId, workspace: response.data.workspace };
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to remove member');
    }
  }
);

const initialState = {
  workspaces: [],
  currentWorkspace: null,
  loading: false,
  error: null,
};

const workspaceSlice = createSlice({
  name: 'workspace',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentWorkspace: (state, action) => {
      state.currentWorkspace = action.payload;
    },
    clearCurrentWorkspace: (state) => {
      state.currentWorkspace = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Workspaces
      .addCase(fetchWorkspaces.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWorkspaces.fulfilled, (state, action) => {
        state.loading = false;
        state.workspaces = action.payload.workspaces;
      })
      .addCase(fetchWorkspaces.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Workspace
      .addCase(createWorkspace.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createWorkspace.fulfilled, (state, action) => {
        state.loading = false;
        state.workspaces.unshift(action.payload.workspace);
      })
      .addCase(createWorkspace.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Workspace
      .addCase(fetchWorkspace.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWorkspace.fulfilled, (state, action) => {
        state.loading = false;
        state.currentWorkspace = action.payload.workspace;
        // Update workspace in list if it exists
        const index = state.workspaces.findIndex(w => w._id === action.payload.workspace._id);
        if (index !== -1) {
          state.workspaces[index] = action.payload.workspace;
        }
      })
      .addCase(fetchWorkspace.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Workspace
      .addCase(updateWorkspace.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateWorkspace.fulfilled, (state, action) => {
        state.loading = false;
        const updatedWorkspace = action.payload.workspace;
        
        // Update in workspaces list
        const index = state.workspaces.findIndex(w => w._id === updatedWorkspace._id);
        if (index !== -1) {
          state.workspaces[index] = updatedWorkspace;
        }
        
        // Update current workspace if it's the same
        if (state.currentWorkspace && state.currentWorkspace._id === updatedWorkspace._id) {
          state.currentWorkspace = updatedWorkspace;
        }
      })
      .addCase(updateWorkspace.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete Workspace
      .addCase(deleteWorkspace.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteWorkspace.fulfilled, (state, action) => {
        state.loading = false;
        state.workspaces = state.workspaces.filter(w => w._id !== action.payload);
        if (state.currentWorkspace && state.currentWorkspace._id === action.payload) {
          state.currentWorkspace = null;
        }
      })
      .addCase(deleteWorkspace.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add Member
      .addCase(addWorkspaceMember.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addWorkspaceMember.fulfilled, (state, action) => {
        state.loading = false;
        const updatedWorkspace = action.payload.workspace;
        
        // Update in workspaces list
        const index = state.workspaces.findIndex(w => w._id === updatedWorkspace._id);
        if (index !== -1) {
          state.workspaces[index] = updatedWorkspace;
        }
        
        // Update current workspace if it's the same
        if (state.currentWorkspace && state.currentWorkspace._id === updatedWorkspace._id) {
          state.currentWorkspace = updatedWorkspace;
        }
      })
      .addCase(addWorkspaceMember.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Remove Member
      .addCase(removeWorkspaceMember.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeWorkspaceMember.fulfilled, (state, action) => {
        state.loading = false;
        const { workspace } = action.payload;
        
        // Update in workspaces list
        const index = state.workspaces.findIndex(w => w._id === workspace._id);
        if (index !== -1) {
          state.workspaces[index] = workspace;
        }
        
        // Update current workspace if it's the same
        if (state.currentWorkspace && state.currentWorkspace._id === workspace._id) {
          state.currentWorkspace = workspace;
        }
      })
      .addCase(removeWorkspaceMember.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, setCurrentWorkspace, clearCurrentWorkspace } = workspaceSlice.actions;
export default workspaceSlice.reducer; 