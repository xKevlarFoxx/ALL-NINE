import { createStore, applyMiddleware } from 'redux';
import createSagaMiddleware from 'redux-saga';

// Use internal organization devtools extension package (adjust the module name/path as needed)
import { composeWithDevTools } from '@allnine/devtools-extension';

import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createSelector } from 'reselect';

// Import the rootReducer from the proper location in your project
import rootReducer from './reducers/rootReducer';

// Import the analytics service (ensure the path/module is correct)
import analyticsService from '../analytics/analyticsService';

// Import state types used for proper typing
import { AuthState, ProfileState, UIState } from './stateTypes';

// Create the saga middleware instance (with an explicit any type for now; adjust as needed)
const sagaMiddleware: SagaMiddleware<any> = createSagaMiddleware();

// Array of middlewares to apply
const middlewares = [sagaMiddleware];

// Compose enhancers with the internal devtools extension
const enhancer = composeWithDevTools(
  applyMiddleware(...middlewares)
);

// Configuration for persistReducer; customize keys and options as required
const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  // Add additional persist configuration options if needed
};

// Create a persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Rename the store variable to avoid conflicts with the DOM Storage global
export const reduxStore = createStore(
  persistedReducer,
  enhancer
);

// Create a persistor for the reduxStore
export const persistor = persistStore(reduxStore);

// Example middleware to intercept actions and integrate analytics with explicit type annotations
export const analyticsMiddleware = (storeAPI: { getState: () => any; dispatch: (action: any) => any; }) =>
  (next: (action: any) => any) =>
    (action: any) => {
      // Log every dispatched action
      analyticsService.logAction(action);
      return next(action);
    };

// Additional configuration and exports can be added here as needed.