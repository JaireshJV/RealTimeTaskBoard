import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Helper function to get auth headers
const getAuthHeaders = (getState) => ({
  Authorization: `Bearer ${getState().auth.token}`
});

// Async thunks
export const fetchCards = createAsyncThunk(
  'card/fetchCards',
  async (boardId, { rejectWithValue, getState }) => {
    try {
      const response = await axios.get(`${API_URL}/cards?boardId=${boardId}`, {
        headers: getAuthHeaders(getState)
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch cards');
    }
  }
);

export const createCard = createAsyncThunk(
  'card/createCard',
  async (cardData, { rejectWithValue, getState }) => {
    try {
      const response = await axios.post(`${API_URL}/cards`, cardData, {
        headers: getAuthHeaders(getState)
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to create card');
    }
  }
);

export const fetchCard = createAsyncThunk(
  'card/fetchCard',
  async (cardId, { rejectWithValue, getState }) => {
    try {
      const response = await axios.get(`${API_URL}/cards/${cardId}`, {
        headers: getAuthHeaders(getState)
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch card');
    }
  }
);

export const updateCard = createAsyncThunk(
  'card/updateCard',
  async ({ cardId, updateData }, { rejectWithValue, getState }) => {
    try {
      const response = await axios.put(`${API_URL}/cards/${cardId}`, updateData, {
        headers: getAuthHeaders(getState)
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to update card');
    }
  }
);

export const deleteCard = createAsyncThunk(
  'card/deleteCard',
  async (cardId, { rejectWithValue, getState }) => {
    try {
      await axios.delete(`${API_URL}/cards/${cardId}`, {
        headers: getAuthHeaders(getState)
      });
      return cardId;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to delete card');
    }
  }
);

export const moveCard = createAsyncThunk(
  'card/moveCard',
  async ({ cardId, listId, order }, { rejectWithValue, getState }) => {
    try {
      const response = await axios.put(`${API_URL}/cards/${cardId}/move`, {
        listId,
        order
      }, {
        headers: getAuthHeaders(getState)
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to move card');
    }
  }
);

export const assignUser = createAsyncThunk(
  'card/assignUser',
  async ({ cardId, userId }, { rejectWithValue, getState }) => {
    try {
      const response = await axios.post(`${API_URL}/cards/${cardId}/assign`, {
        userId
      }, {
        headers: getAuthHeaders(getState)
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to assign user');
    }
  }
);

export const unassignUser = createAsyncThunk(
  'card/unassignUser',
  async ({ cardId, userId }, { rejectWithValue, getState }) => {
    try {
      const response = await axios.delete(`${API_URL}/cards/${cardId}/assign/${userId}`, {
        headers: getAuthHeaders(getState)
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to unassign user');
    }
  }
);

export const addComment = createAsyncThunk(
  'card/addComment',
  async ({ cardId, content }, { rejectWithValue, getState }) => {
    try {
      const response = await axios.post(`${API_URL}/cards/${cardId}/comments`, {
        content
      }, {
        headers: getAuthHeaders(getState)
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to add comment');
    }
  }
);

export const toggleComplete = createAsyncThunk(
  'card/toggleComplete',
  async (cardId, { rejectWithValue, getState }) => {
    try {
      const response = await axios.put(`${API_URL}/cards/${cardId}/complete`, {}, {
        headers: getAuthHeaders(getState)
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to toggle completion');
    }
  }
);

const initialState = {
  cards: {},
  currentCard: null,
  loading: false,
  error: null,
};

const cardSlice = createSlice({
  name: 'card',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentCard: (state, action) => {
      state.currentCard = action.payload;
    },
    clearCurrentCard: (state) => {
      state.currentCard = null;
    },
    // Optimistic updates for drag and drop
    moveCardOptimistic: (state, action) => {
      const { cardId, sourceListId, destinationListId, sourceIndex, destinationIndex } = action.payload;
      
      // Remove from source list
      if (state.cards[sourceListId]) {
        state.cards[sourceListId] = state.cards[sourceListId].filter(card => card._id !== cardId);
      }
      
      // Add to destination list
      if (!state.cards[destinationListId]) {
        state.cards[destinationListId] = [];
      }
      
      // Find the card in current state
      let cardToMove = null;
      Object.values(state.cards).forEach(cardList => {
        const found = cardList.find(card => card._id === cardId);
        if (found) cardToMove = found;
      });
      
      if (cardToMove) {
        cardToMove.list = destinationListId;
        cardToMove.order = destinationIndex;
        state.cards[destinationListId].splice(destinationIndex, 0, cardToMove);
      }
    },
    // Real-time updates from socket
    updateCardFromSocket: (state, action) => {
      const { card, type } = action.payload;
      
      switch (type) {
        case 'card-added':
          if (!state.cards[card.list]) {
            state.cards[card.list] = [];
          }
          state.cards[card.list].push(card);
          break;
        case 'card-modified':
          Object.keys(state.cards).forEach(listId => {
            const index = state.cards[listId].findIndex(c => c._id === card._id);
            if (index !== -1) {
              state.cards[listId][index] = card;
            }
          });
          break;
        case 'card-removed':
          Object.keys(state.cards).forEach(listId => {
            state.cards[listId] = state.cards[listId].filter(c => c._id !== card._id);
          });
          break;
        case 'card-updated':
          Object.keys(state.cards).forEach(listId => {
            const index = state.cards[listId].findIndex(c => c._id === card._id);
            if (index !== -1) {
              state.cards[listId][index] = card;
            }
          });
          break;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Cards
      .addCase(fetchCards.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCards.fulfilled, (state, action) => {
        state.loading = false;
        state.cards = action.payload.cards;
      })
      .addCase(fetchCards.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Card
      .addCase(createCard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCard.fulfilled, (state, action) => {
        state.loading = false;
        const card = action.payload.card;
        if (!state.cards[card.list]) {
          state.cards[card.list] = [];
        }
        state.cards[card.list].push(card);
      })
      .addCase(createCard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Card
      .addCase(fetchCard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCard.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCard = action.payload.card;
      })
      .addCase(fetchCard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Card
      .addCase(updateCard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCard.fulfilled, (state, action) => {
        state.loading = false;
        const updatedCard = action.payload.card;
        
        // Update in cards list
        Object.keys(state.cards).forEach(listId => {
          const index = state.cards[listId].findIndex(c => c._id === updatedCard._id);
          if (index !== -1) {
            state.cards[listId][index] = updatedCard;
          }
        });
        
        // Update current card if it's the same
        if (state.currentCard && state.currentCard._id === updatedCard._id) {
          state.currentCard = updatedCard;
        }
      })
      .addCase(updateCard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete Card
      .addCase(deleteCard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCard.fulfilled, (state, action) => {
        state.loading = false;
        const cardId = action.payload;
        
        // Remove from all lists
        Object.keys(state.cards).forEach(listId => {
          state.cards[listId] = state.cards[listId].filter(c => c._id !== cardId);
        });
        
        // Clear current card if it's the same
        if (state.currentCard && state.currentCard._id === cardId) {
          state.currentCard = null;
        }
      })
      .addCase(deleteCard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Move Card
      .addCase(moveCard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(moveCard.fulfilled, (state, action) => {
        state.loading = false;
        const updatedCard = action.payload.card;
        
        // Update in cards list
        Object.keys(state.cards).forEach(listId => {
          const index = state.cards[listId].findIndex(c => c._id === updatedCard._id);
          if (index !== -1) {
            state.cards[listId][index] = updatedCard;
          }
        });
      })
      .addCase(moveCard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Assign User
      .addCase(assignUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(assignUser.fulfilled, (state, action) => {
        state.loading = false;
        const updatedCard = action.payload.card;
        
        // Update in cards list
        Object.keys(state.cards).forEach(listId => {
          const index = state.cards[listId].findIndex(c => c._id === updatedCard._id);
          if (index !== -1) {
            state.cards[listId][index] = updatedCard;
          }
        });
        
        // Update current card if it's the same
        if (state.currentCard && state.currentCard._id === updatedCard._id) {
          state.currentCard = updatedCard;
        }
      })
      .addCase(assignUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Unassign User
      .addCase(unassignUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(unassignUser.fulfilled, (state, action) => {
        state.loading = false;
        const updatedCard = action.payload.card;
        
        // Update in cards list
        Object.keys(state.cards).forEach(listId => {
          const index = state.cards[listId].findIndex(c => c._id === updatedCard._id);
          if (index !== -1) {
            state.cards[listId][index] = updatedCard;
          }
        });
        
        // Update current card if it's the same
        if (state.currentCard && state.currentCard._id === updatedCard._id) {
          state.currentCard = updatedCard;
        }
      })
      .addCase(unassignUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add Comment
      .addCase(addComment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addComment.fulfilled, (state, action) => {
        state.loading = false;
        const updatedCard = action.payload.card;
        
        // Update in cards list
        Object.keys(state.cards).forEach(listId => {
          const index = state.cards[listId].findIndex(c => c._id === updatedCard._id);
          if (index !== -1) {
            state.cards[listId][index] = updatedCard;
          }
        });
        
        // Update current card if it's the same
        if (state.currentCard && state.currentCard._id === updatedCard._id) {
          state.currentCard = updatedCard;
        }
      })
      .addCase(addComment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Toggle Complete
      .addCase(toggleComplete.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(toggleComplete.fulfilled, (state, action) => {
        state.loading = false;
        const updatedCard = action.payload.card;
        
        // Update in cards list
        Object.keys(state.cards).forEach(listId => {
          const index = state.cards[listId].findIndex(c => c._id === updatedCard._id);
          if (index !== -1) {
            state.cards[listId][index] = updatedCard;
          }
        });
        
        // Update current card if it's the same
        if (state.currentCard && state.currentCard._id === updatedCard._id) {
          state.currentCard = updatedCard;
        }
      })
      .addCase(toggleComplete.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { 
  clearError, 
  setCurrentCard, 
  clearCurrentCard, 
  moveCardOptimistic,
  updateCardFromSocket 
} = cardSlice.actions;
export default cardSlice.reducer; 