import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import appReducer from './slices/appSlice';
import sidebarReducer from './slices/sidebarSlice';
import type { RootState } from './types';

const persistConfig = {
  key: 'reddit-viewer',
  storage,
  whitelist: ['sidebar'], // Only persist sidebar state (recent posts)
};

const rootReducer = combineReducers({
  app: appReducer,
  sidebar: sidebarReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export const persistor = persistStore(store);

export type { RootState };
export type AppDispatch = typeof store.dispatch;
