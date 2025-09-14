import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import reducers
import authReducer from './reducers/authReducer';
import userReducer from './reducers/userReducer';
import locationReducer from './reducers/locationReducer';
import alertReducer from './reducers/alertReducer';
import tripReducer from './reducers/tripReducer';

// Persist config
const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth', 'user'], // Only persist auth and user data
};

// Root reducer
const rootReducer = combineReducers({
  auth: authReducer,
  user: userReducer,
  location: locationReducer,
  alert: alertReducer,
  trip: tripReducer,
});

// Persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['payload.timestamp'],
        // Ignore these paths in the state
        ignoredPaths: ['auth.user', 'auth.error'],
      },
      // Disable immutable check for development
      immutableCheck: false,
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

// Persistor
export const persistor = persistStore(store);

// Export types
export const RootState = store.getState;
export const AppDispatch = store.dispatch;
