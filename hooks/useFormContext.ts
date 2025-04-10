import React, { createContext, useContext, useReducer } from 'react';

interface FormState {
  currentStep: number;
  data: Record<string, any>;
  validation: { errors: Record<string, string>; isValid: boolean };
  ui: { isLoading: boolean; helpModalVisible: boolean };
}

interface FormAction {
  type: string;
  payload?: any;
}

const initialState: FormState = {
  currentStep: 0,
  data: {},
  validation: { errors: {}, isValid: true },
  ui: { isLoading: false, helpModalVisible: false },
};

const formReducer = (state: FormState, action: FormAction): FormState => {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, currentStep: action.payload };
    case 'SET_FIELD_VALUE':
      return { ...state, data: { ...state.data, [action.payload.field]: action.payload.value } };
    case 'VALIDATE_FIELD':
      return { ...state, validation: action.payload.result };
    case 'SET_LOADING':
      return { ...state, ui: { ...state.ui, isLoading: action.payload } };
    case 'TOGGLE_HELP':
      return { ...state, ui: { ...state.ui, helpModalVisible: !!action.payload } };
    default:
      return state;
  }
};

const FormContext = createContext<{ state: FormState; dispatch: React.Dispatch<FormAction> } | undefined>(undefined);

export const FormProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(formReducer, initialState);
  return (
    <FormContext.Provider value={{ state, dispatch }}>
        {children}
    </FormContext.Provider>
  );
};

export const useFormContext = () => {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('useFormContext must be used within a FormProvider');
  }
  return context;
};