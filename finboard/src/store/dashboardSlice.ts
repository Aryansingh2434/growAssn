import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Widget, DashboardState } from '../types';

const loadStateFromStorage = (): Partial<DashboardState> => {
  if (typeof window === 'undefined') return {};
  
  try {
    const savedState = localStorage.getItem('finboard-dashboard');
    return savedState ? JSON.parse(savedState) : {};
  } catch {
    return {};
  }
};

const saveStateToStorage = (state: DashboardState) => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem('finboard-dashboard', JSON.stringify({
      widgets: state.widgets,
      apiKeys: state.apiKeys,
    }));
  } catch (error) {
    console.error('Failed to save state to localStorage:', error);
  }
};

const initialState: DashboardState = {
  widgets: [],
  selectedWidget: null,
  isLoading: false,
  error: null,
  apiKeys: {},
  ...loadStateFromStorage(),
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    addWidget: (state, action: PayloadAction<Widget>) => {
      state.widgets.push(action.payload);
      saveStateToStorage(state);
    },
    
    removeWidget: (state, action: PayloadAction<string>) => {
      state.widgets = state.widgets.filter(widget => widget.id !== action.payload);
      if (state.selectedWidget === action.payload) {
        state.selectedWidget = null;
      }
      saveStateToStorage(state);
    },
    
    updateWidget: (state, action: PayloadAction<Partial<Widget> & { id: string }>) => {
      const index = state.widgets.findIndex(widget => widget.id === action.payload.id);
      if (index !== -1) {
        state.widgets[index] = { ...state.widgets[index], ...action.payload };
        saveStateToStorage(state);
      }
    },
    
    reorderWidgets: (state, action: PayloadAction<Widget[]>) => {
      state.widgets = action.payload;
      saveStateToStorage(state);
    },
    
    selectWidget: (state, action: PayloadAction<string | null>) => {
      state.selectedWidget = action.payload;
    },
    
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    
    setApiKey: (state, action: PayloadAction<{ provider: string; key: string }>) => {
      state.apiKeys[action.payload.provider] = action.payload.key;
      saveStateToStorage(state);
    },
    
    updateWidgetData: (state, action: PayloadAction<{ id: string; data: any }>) => {
      const widget = state.widgets.find(w => w.id === action.payload.id);
      if (widget) {
        widget.lastUpdated = new Date();
        // Data will be handled by the component
      }
    },
  },
});

export const {
  addWidget,
  removeWidget,
  updateWidget,
  reorderWidgets,
  selectWidget,
  setLoading,
  setError,
  setApiKey,
  updateWidgetData,
} = dashboardSlice.actions;

export default dashboardSlice.reducer;
