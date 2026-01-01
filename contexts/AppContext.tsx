import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { BrandIdentity, GeneratedImages, SocialMediaPost } from '../types';

// State interface
export interface AppState {
  brandIdentity: BrandIdentity | null;
  generatedImages: GeneratedImages | null;
  isLoading: boolean;
  error: string | null;
  mission: string;
  activeTab: 'bible' | 'templates' | 'styleguide' | 'bulkcontent' | 'brandhealth' | 'competitors' | 'hashtags' | 'editor' | 'batch' | 'copywriting' | 'video' | 'analytics' | 'calendar' | 'guidelines' | 'assets' | 'schedule' | 'performance' | 'insights' | 'accounts' | 'batchlogo';
  savedProjects: SavedProject[];
  currentProject: SavedProject | null;
  apiRequestsInProgress: number;
  cache: Map<string, CacheEntry>;
}

export interface SavedProject {
  id: string;
  name: string;
  mission: string;
  brandIdentity: BrandIdentity;
  generatedImages: GeneratedImages | null;
  createdAt: Date;
  updatedAt: Date;
}

interface CacheEntry {
  data: any;
  timestamp: number;
  expiresIn: number;
}

// Action types
type AppAction =
  | { type: 'SET_BRAND_IDENTITY'; payload: BrandIdentity }
  | { type: 'SET_GENERATED_IMAGES'; payload: GeneratedImages | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_MISSION'; payload: string }
  | { type: 'SET_ACTIVE_TAB'; payload: AppState['activeTab'] }
  | { type: 'UPDATE_VISUAL'; payload: { postIndex: number; newVisualData: Partial<SocialMediaPost> } }
  | { type: 'SAVE_PROJECT'; payload: SavedProject }
  | { type: 'LOAD_PROJECT'; payload: SavedProject }
  | { type: 'DELETE_PROJECT'; payload: string }
  | { type: 'SET_SAVED_PROJECTS'; payload: SavedProject[] }
  | { type: 'INCREMENT_API_REQUESTS' }
  | { type: 'DECREMENT_API_REQUESTS' }
  | { type: 'CACHE_SET'; payload: { key: string; data: any; expiresIn: number } }
  | { type: 'CACHE_CLEAR' }
  | { type: 'RESET_STATE' };

// Initial state
const initialState: AppState = {
  brandIdentity: null,
  generatedImages: null,
  isLoading: false,
  error: null,
  mission: '',
  activeTab: 'bible',
  savedProjects: [],
  currentProject: null,
  apiRequestsInProgress: 0,
  cache: new Map(),
};

// Reducer
const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_BRAND_IDENTITY':
      return { ...state, brandIdentity: action.payload, error: null };
    
    case 'SET_GENERATED_IMAGES':
      return { ...state, generatedImages: action.payload };
    
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    
    case 'SET_MISSION':
      return { ...state, mission: action.payload };
    
    case 'SET_ACTIVE_TAB':
      return { ...state, activeTab: action.payload };
    
    case 'UPDATE_VISUAL':
      if (!state.brandIdentity) return state;
      const updatedPosts = [...state.brandIdentity.socialMediaPosts];
      updatedPosts[action.payload.postIndex] = {
        ...updatedPosts[action.payload.postIndex],
        ...action.payload.newVisualData,
      };
      return {
        ...state,
        brandIdentity: {
          ...state.brandIdentity,
          socialMediaPosts: updatedPosts,
        },
      };
    
    case 'SAVE_PROJECT':
      return {
        ...state,
        savedProjects: [...state.savedProjects.filter(p => p.id !== action.payload.id), action.payload],
        currentProject: action.payload,
      };
    
    case 'LOAD_PROJECT':
      return {
        ...state,
        currentProject: action.payload,
        brandIdentity: action.payload.brandIdentity,
        generatedImages: action.payload.generatedImages,
        mission: action.payload.mission,
      };
    
    case 'DELETE_PROJECT':
      return {
        ...state,
        savedProjects: state.savedProjects.filter(p => p.id !== action.payload),
        currentProject: state.currentProject?.id === action.payload ? null : state.currentProject,
      };
    
    case 'SET_SAVED_PROJECTS':
      return { ...state, savedProjects: action.payload };
    
    case 'INCREMENT_API_REQUESTS':
      return { ...state, apiRequestsInProgress: state.apiRequestsInProgress + 1 };
    
    case 'DECREMENT_API_REQUESTS':
      return { ...state, apiRequestsInProgress: Math.max(0, state.apiRequestsInProgress - 1) };
    
    case 'CACHE_SET':
      const newCache = new Map(state.cache);
      newCache.set(action.payload.key, {
        data: action.payload.data,
        timestamp: Date.now(),
        expiresIn: action.payload.expiresIn,
      });
      return { ...state, cache: newCache };
    
    case 'CACHE_CLEAR':
      return { ...state, cache: new Map() };
    
    case 'RESET_STATE':
      return { ...initialState, savedProjects: state.savedProjects };
    
    default:
      return state;
  }
};

// Context
interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  actions: {
    setBrandIdentity: (identity: BrandIdentity) => void;
    setGeneratedImages: (images: GeneratedImages | null) => void;
    setLoading: (isLoading: boolean) => void;
    setError: (error: string | null) => void;
    setMission: (mission: string) => void;
    setActiveTab: (tab: AppState['activeTab']) => void;
    updateVisual: (postIndex: number, newVisualData: Partial<SocialMediaPost>) => void;
    saveProject: (project: SavedProject) => void;
    loadProject: (project: SavedProject) => void;
    deleteProject: (id: string) => void;
    setSavedProjects: (projects: SavedProject[]) => void;
    resetState: () => void;
    getCachedData: (key: string) => any | null;
    setCachedData: (key: string, data: any, expiresIn?: number) => void;
    clearCache: () => void;
  };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider component
export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Helper actions
  const actions = {
    setBrandIdentity: (identity: BrandIdentity) => 
      dispatch({ type: 'SET_BRAND_IDENTITY', payload: identity }),
    
    setGeneratedImages: (images: GeneratedImages | null) =>
      dispatch({ type: 'SET_GENERATED_IMAGES', payload: images }),
    
    setLoading: (isLoading: boolean) =>
      dispatch({ type: 'SET_LOADING', payload: isLoading }),
    
    setError: (error: string | null) =>
      dispatch({ type: 'SET_ERROR', payload: error }),
    
    setMission: (mission: string) =>
      dispatch({ type: 'SET_MISSION', payload: mission }),
    
    setActiveTab: (tab: AppState['activeTab']) =>
      dispatch({ type: 'SET_ACTIVE_TAB', payload: tab }),
    
    updateVisual: (postIndex: number, newVisualData: Partial<SocialMediaPost>) =>
      dispatch({ type: 'UPDATE_VISUAL', payload: { postIndex, newVisualData } }),
    
    saveProject: (project: SavedProject) =>
      dispatch({ type: 'SAVE_PROJECT', payload: project }),
    
    loadProject: (project: SavedProject) =>
      dispatch({ type: 'LOAD_PROJECT', payload: project }),
    
    deleteProject: (id: string) =>
      dispatch({ type: 'DELETE_PROJECT', payload: id }),
    
    setSavedProjects: (projects: SavedProject[]) =>
      dispatch({ type: 'SET_SAVED_PROJECTS', payload: projects }),
    
    resetState: () =>
      dispatch({ type: 'RESET_STATE' }),
    
    getCachedData: (key: string): any | null => {
      const entry = state.cache.get(key);
      if (!entry) return null;
      
      const isExpired = Date.now() - entry.timestamp > entry.expiresIn;
      if (isExpired) {
        const newCache = new Map(state.cache);
        newCache.delete(key);
        dispatch({ type: 'CACHE_CLEAR' });
        return null;
      }
      
      return entry.data;
    },
    
    setCachedData: (key: string, data: any, expiresIn: number = 300000) => {
      dispatch({ type: 'CACHE_SET', payload: { key, data, expiresIn } });
    },
    
    clearCache: () => dispatch({ type: 'CACHE_CLEAR' }),
  };

  return (
    <AppContext.Provider value={{ state, dispatch, actions }}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook
export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
