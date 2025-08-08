import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // Modal states
  modals: {
    createWorkspace: false,
    createBoard: false,
    createCard: false,
    editCard: false,
    cardDetails: false,
    workspaceSettings: false,
    boardSettings: false,
    userProfile: false,
    addMember: false,
  },
  // Loading states
  loading: {
    global: false,
    workspace: false,
    board: false,
    card: false,
  },
  // Notifications
  notifications: [],
  // Sidebar state
  sidebarOpen: true,
  // Theme
  theme: 'light',
  // Current view
  currentView: 'workspaces', // workspaces, boards, board
  // Selected items
  selectedWorkspace: null,
  selectedBoard: null,
  selectedCard: null,
  // Drag and drop state
  dragState: {
    isDragging: false,
    draggedItem: null,
    dragType: null, // 'card', 'list'
  },
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Modal actions
    openModal: (state, action) => {
      const { modalName } = action.payload;
      if (state.modals.hasOwnProperty(modalName)) {
        state.modals[modalName] = true;
      }
    },
    closeModal: (state, action) => {
      const { modalName } = action.payload;
      if (state.modals.hasOwnProperty(modalName)) {
        state.modals[modalName] = false;
      }
    },
    closeAllModals: (state) => {
      Object.keys(state.modals).forEach(key => {
        state.modals[key] = false;
      });
    },
    
    // Loading actions
    setLoading: (state, action) => {
      const { type, isLoading } = action.payload;
      if (state.loading.hasOwnProperty(type)) {
        state.loading[type] = isLoading;
      }
    },
    setGlobalLoading: (state, action) => {
      state.loading.global = action.payload;
    },
    
    // Notification actions
    addNotification: (state, action) => {
      const { id, type, message, duration = 5000 } = action.payload;
      state.notifications.push({
        id,
        type, // 'success', 'error', 'warning', 'info'
        message,
        duration,
        timestamp: Date.now(),
      });
    },
    removeNotification: (state, action) => {
      const { id } = action.payload;
      state.notifications = state.notifications.filter(notification => notification.id !== id);
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
    
    // Sidebar actions
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload;
    },
    
    // Theme actions
    setTheme: (state, action) => {
      state.theme = action.payload;
      // Save to localStorage
      localStorage.setItem('theme', action.payload);
    },
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', state.theme);
    },
    
    // View actions
    setCurrentView: (state, action) => {
      state.currentView = action.payload;
    },
    
    // Selection actions
    setSelectedWorkspace: (state, action) => {
      state.selectedWorkspace = action.payload;
    },
    setSelectedBoard: (state, action) => {
      state.selectedBoard = action.payload;
    },
    setSelectedCard: (state, action) => {
      state.selectedCard = action.payload;
    },
    clearSelection: (state) => {
      state.selectedWorkspace = null;
      state.selectedBoard = null;
      state.selectedCard = null;
    },
    
    // Drag and drop actions
    startDrag: (state, action) => {
      const { item, type } = action.payload;
      state.dragState = {
        isDragging: true,
        draggedItem: item,
        dragType: type,
      };
    },
    endDrag: (state) => {
      state.dragState = {
        isDragging: false,
        draggedItem: null,
        dragType: null,
      };
    },
    
    // Error handling
    setError: (state, action) => {
      const { message, type = 'error' } = action.payload;
      state.notifications.push({
        id: Date.now(),
        type,
        message,
        duration: 5000,
        timestamp: Date.now(),
      });
    },
    
    // Success handling
    setSuccess: (state, action) => {
      const { message } = action.payload;
      state.notifications.push({
        id: Date.now(),
        type: 'success',
        message,
        duration: 3000,
        timestamp: Date.now(),
      });
    },
    
    // Reset UI state
    resetUI: (state) => {
      return {
        ...initialState,
        theme: state.theme, // Preserve theme
        sidebarOpen: state.sidebarOpen, // Preserve sidebar state
      };
    },
  },
});

export const {
  openModal,
  closeModal,
  closeAllModals,
  setLoading,
  setGlobalLoading,
  addNotification,
  removeNotification,
  clearNotifications,
  toggleSidebar,
  setSidebarOpen,
  setTheme,
  toggleTheme,
  setCurrentView,
  setSelectedWorkspace,
  setSelectedBoard,
  setSelectedCard,
  clearSelection,
  startDrag,
  endDrag,
  setError,
  setSuccess,
  resetUI,
} = uiSlice.actions;

export default uiSlice.reducer; 