import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Helper function to get auth headers
const getAuthHeaders = (getState) => ({
  Authorization: `Bearer ${getState().auth.token}`
});

// Async thunks
export const fetchBoards = createAsyncThunk(
  'board/fetchBoards',
  async (workspaceId, { rejectWithValue, getState }) => {
    try {
      const url = workspaceId 
        ? `${API_URL}/boards?workspaceId=${workspaceId}`
        : `${API_URL}/boards`;
      const response = await axios.get(url, {
        headers: getAuthHeaders(getState)
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch boards');
    }
  }
);

export const createBoard = createAsyncThunk(
  'board/createBoard',
  async (boardData, { rejectWithValue, getState }) => {
    try {
      const response = await axios.post(`${API_URL}/boards`, boardData, {
        headers: getAuthHeaders(getState)
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to create board');
    }
  }
);

export const fetchBoard = createAsyncThunk(
  'board/fetchBoard',
  async (boardId, { rejectWithValue, getState }) => {
    try {
      const response = await axios.get(`${API_URL}/boards/${boardId}`, {
        headers: getAuthHeaders(getState)
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch board');
    }
  }
);

export const updateBoard = createAsyncThunk(
  'board/updateBoard',
  async ({ boardId, updateData }, { rejectWithValue, getState }) => {
    try {
      const response = await axios.put(`${API_URL}/boards/${boardId}`, updateData, {
        headers: getAuthHeaders(getState)
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to update board');
    }
  }
);

export const deleteBoard = createAsyncThunk(
  'board/deleteBoard',
  async (boardId, { rejectWithValue, getState }) => {
    try {
      await axios.delete(`${API_URL}/boards/${boardId}`, {
        headers: getAuthHeaders(getState)
      });
      return boardId;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to delete board');
    }
  }
);

export const addList = createAsyncThunk(
  'board/addList',
  async ({ boardId, listData }, { rejectWithValue, getState }) => {
    try {
      const response = await axios.post(`${API_URL}/boards/${boardId}/lists`, listData, {
        headers: getAuthHeaders(getState)
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to add list');
    }
  }
);

export const updateList = createAsyncThunk(
  'board/updateList',
  async ({ boardId, listId, updateData }, { rejectWithValue, getState }) => {
    try {
      const response = await axios.put(`${API_URL}/boards/${boardId}/lists/${listId}`, updateData, {
        headers: getAuthHeaders(getState)
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to update list');
    }
  }
);

export const deleteList = createAsyncThunk(
  'board/deleteList',
  async ({ boardId, listId }, { rejectWithValue, getState }) => {
    try {
      const response = await axios.delete(`${API_URL}/boards/${boardId}/lists/${listId}`, {
        headers: getAuthHeaders(getState)
      });
      return { boardId, listId, board: response.data.board };
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to delete list');
    }
  }
);

const initialState = {
  boards: [],
  currentBoard: null,
  loading: false,
  error: null,
};

const boardSlice = createSlice({
  name: 'board',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentBoard: (state, action) => {
      state.currentBoard = action.payload;
    },
    clearCurrentBoard: (state) => {
      state.currentBoard = null;
    },
    updateBoardInList: (state, action) => {
      const { boardId, updates } = action.payload;
      const index = state.boards.findIndex(b => b._id === boardId);
      if (index !== -1) {
        state.boards[index] = { ...state.boards[index], ...updates };
      }
      if (state.currentBoard && state.currentBoard._id === boardId) {
        state.currentBoard = { ...state.currentBoard, ...updates };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Boards
      .addCase(fetchBoards.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBoards.fulfilled, (state, action) => {
        state.loading = false;
        state.boards = action.payload.boards;
      })
      .addCase(fetchBoards.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Board
      .addCase(createBoard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBoard.fulfilled, (state, action) => {
        state.loading = false;
        state.boards.unshift(action.payload.board);
      })
      .addCase(createBoard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Board
      .addCase(fetchBoard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBoard.fulfilled, (state, action) => {
        state.loading = false;
        state.currentBoard = action.payload.board;
        // Update board in list if it exists
        const index = state.boards.findIndex(b => b._id === action.payload.board._id);
        if (index !== -1) {
          state.boards[index] = action.payload.board;
        }
      })
      .addCase(fetchBoard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Board
      .addCase(updateBoard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBoard.fulfilled, (state, action) => {
        state.loading = false;
        const updatedBoard = action.payload.board;
        
        // Update in boards list
        const index = state.boards.findIndex(b => b._id === updatedBoard._id);
        if (index !== -1) {
          state.boards[index] = updatedBoard;
        }
        
        // Update current board if it's the same
        if (state.currentBoard && state.currentBoard._id === updatedBoard._id) {
          state.currentBoard = updatedBoard;
        }
      })
      .addCase(updateBoard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete Board
      .addCase(deleteBoard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteBoard.fulfilled, (state, action) => {
        state.loading = false;
        state.boards = state.boards.filter(b => b._id !== action.payload);
        if (state.currentBoard && state.currentBoard._id === action.payload) {
          state.currentBoard = null;
        }
      })
      .addCase(deleteBoard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add List
      .addCase(addList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addList.fulfilled, (state, action) => {
        state.loading = false;
        const updatedBoard = action.payload.board;
        
        // Update in boards list
        const index = state.boards.findIndex(b => b._id === updatedBoard._id);
        if (index !== -1) {
          state.boards[index] = updatedBoard;
        }
        
        // Update current board if it's the same
        if (state.currentBoard && state.currentBoard._id === updatedBoard._id) {
          state.currentBoard = updatedBoard;
        }
      })
      .addCase(addList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update List
      .addCase(updateList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateList.fulfilled, (state, action) => {
        state.loading = false;
        const updatedBoard = action.payload.board;
        
        // Update in boards list
        const index = state.boards.findIndex(b => b._id === updatedBoard._id);
        if (index !== -1) {
          state.boards[index] = updatedBoard;
        }
        
        // Update current board if it's the same
        if (state.currentBoard && state.currentBoard._id === updatedBoard._id) {
          state.currentBoard = updatedBoard;
        }
      })
      .addCase(updateList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete List
      .addCase(deleteList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteList.fulfilled, (state, action) => {
        state.loading = false;
        const { board } = action.payload;
        
        // Update in boards list
        const index = state.boards.findIndex(b => b._id === board._id);
        if (index !== -1) {
          state.boards[index] = board;
        }
        
        // Update current board if it's the same
        if (state.currentBoard && state.currentBoard._id === board._id) {
          state.currentBoard = board;
        }
      })
      .addCase(deleteList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, setCurrentBoard, clearCurrentBoard, updateBoardInList } = boardSlice.actions;
export default boardSlice.reducer; 