// services/state/StateManager.ts
import { createStore, applyMiddleware } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { composeWithDevTools } from 'redux-devtools-extension';
import { createSelector } from 'reselect';

// Core state management
const sagaMiddleware = createSagaMiddleware();

export class StateManager {
  private static instance: StateManager;
  private stateSnapshots: Map<string, any> = new Map();
  private stateSubscriptions: Map<string, Set<(state: any) => void>> = new Map();

  private constructor() {
    this.initializeStore();
  }

  static getInstance(): StateManager {
    if (!StateManager.instance) {
      StateManager.instance = new StateManager();
    }
    return StateManager.instance;
  }

  private initializeStore() {
    const persistConfig = {
      key: 'root',
      storage: AsyncStorage,
      whitelist: ['auth', 'profile', 'settings'],
      blacklist: ['temp', 'ui'],
    };

    const middleware = [
      sagaMiddleware,
      this.createLoggingMiddleware(),
      this.createAnalyticsMiddleware(),
      this.createPersistenceMiddleware(),
    ];

    const store = createStore(
      persistReducer(persistConfig, rootReducer),
      composeWithDevTools(applyMiddleware(...middleware))
    );

    persistStore(store);
    return store;
  }

  // State snapshots
  takeSnapshot(key: string): void {
    const currentState = store.getState();
    this.stateSnapshots.set(key, JSON.stringify(currentState));
  }

  restoreSnapshot(key: string): boolean {
    const snapshot = this.stateSnapshots.get(key);
    if (snapshot) {
      store.dispatch({ type: 'RESTORE_STATE', payload: JSON.parse(snapshot) });
      return true;
    }
    return false;
  }

  // Selective updates
  updateState(path: string, value: any): void {
    const action = {
      type: 'UPDATE_STATE',
      payload: { path, value },
    };
    store.dispatch(action);
  }

  // State subscriptions
  subscribe(path: string, callback: (state: any) => void): () => void {
    if (!this.stateSubscriptions.has(path)) {
      this.stateSubscriptions.set(path, new Set());
    }
    this.stateSubscriptions.get(path)!.add(callback);

    return () => {
      this.stateSubscriptions.get(path)?.delete(callback);
    };
  }

  // Middleware creators
  private createLoggingMiddleware() {
    return (store) => (next) => (action) => {
      if (__DEV__) {
        console.log('Dispatching:', action);
      }
      const result = next(action);
      if (__DEV__) {
        console.log('New State:', store.getState());
      }
      return result;
    };
  }

  private createAnalyticsMiddleware() {
    return () => (next) => (action) => {
      const result = next(action);
      analyticsService.track('State_Change', {
        action: action.type,
        timestamp: Date.now(),
      });
      return result;
    };
  }

  private createPersistenceMiddleware() {
    return (store) => (next) => (action) => {
      const result = next(action);
      if (action.type !== 'RESTORE_STATE') {
        this.persistStateToStorage(store.getState());
      }
      return result;
    };
  }

  // Selectors
  createSelector(paths: string[], selectorFn: (...args: any[]) => any) {
    return createSelector(
      paths.map(path => (state) => _.get(state, path)),
      selectorFn
    );
  }

  // State validation
  validateState(schema: any): boolean {
    try {
      const currentState = store.getState();
      return schema.isValidSync(currentState);
    } catch (error) {
      console.error('State validation failed:', error);
      return false;
    }
  }

  // State migrations
  migrateState(version: number, migrationFn: (state: any) => any): void {
    const currentState = store.getState();
    const migratedState = migrationFn(currentState);
    store.dispatch({ type: 'MIGRATE_STATE', payload: { version, state: migratedState } });
  }

  // State persistence
  private async persistStateToStorage(state: any): Promise<void> {
    try {
      await AsyncStorage.setItem('app_state', JSON.stringify(state));
    } catch (error) {
      console.error('Failed to persist state:', error);
    }
  }
}

// State slices with TypeScript
interface AppState {
  auth: AuthState;
  profile: ProfileState;
  ui: UIState;
  // Add more slices as needed
}

// Example slice
const createSlice = <T extends object>(options: {
  name: string;
  initialState: T;
  reducers: Record<string, (state: T, action: any) => void>;
}) => {
  return {
    name: options.name,
    reducer: (state = options.initialState, action: any) => {
      const reducer = options.reducers[action.type];
      return reducer ? reducer(state, action) : state;
    },
    actions: Object.keys(options.reducers).reduce((acc, key) => {
      acc[key] = (payload?: any) => ({ type: key, payload });
      return acc;
    }, {} as Record<string, (payload?: any) => any>),
  };
};

// Example usage
const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    theme: 'light',
    loading: false,
    modal: null,
  },
  reducers: {
    setTheme: (state, action) => {
      state.theme = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    showModal: (state, action) => {
      state.modal = action.payload;
    },
  },
});

export const stateManager = StateManager.getInstance();