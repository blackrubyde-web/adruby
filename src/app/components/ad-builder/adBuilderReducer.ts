export type AdBuilderData = {
  brandName: string;
  productName: string;
  productDescription: string;
  targetAudience: string;
  ageRange: string;
  interests: string;
  painPoints: string;
  uniqueSellingPoint: string;
  budget: string;
  duration: string;
  objective: string;
  strategyId: string;
};

export type AdBuilderState = {
  currentStep: number;
  formData: AdBuilderData;
};

export const initialAdBuilderState: AdBuilderState = {
  currentStep: 1,
  formData: {
    brandName: '',
    productName: '',
    productDescription: '',
    targetAudience: '',
    ageRange: '',
    interests: '',
    painPoints: '',
    uniqueSellingPoint: '',
    budget: '',
    duration: '',
    objective: 'conversions',
    strategyId: ''
  }
};

export type AdBuilderAction =
  | { type: 'SET_FIELD'; field: keyof AdBuilderData; value: string }
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }
  | { type: 'SET_STEP'; step: number }
  | { type: 'LOAD_DRAFT'; payload: { currentStep?: number; formData?: Partial<AdBuilderData> } }
  | { type: 'RESET' };

export function adBuilderReducer(state: AdBuilderState, action: AdBuilderAction): AdBuilderState {
  switch (action.type) {
    case 'SET_FIELD':
      return {
        ...state,
        formData: {
          ...state.formData,
          [action.field]: action.value
        }
      };
    case 'NEXT_STEP':
      return {
        ...state,
        currentStep: Math.min(state.currentStep + 1, 6)
      };
    case 'PREV_STEP':
      return {
        ...state,
        currentStep: Math.max(state.currentStep - 1, 1)
      };
    case 'SET_STEP':
      return {
        ...state,
        currentStep: action.step
      };
    case 'LOAD_DRAFT':
      return {
        currentStep: action.payload.currentStep ?? state.currentStep,
        formData: {
          ...state.formData,
          ...(action.payload.formData || {})
        }
      };
    case 'RESET':
      return initialAdBuilderState;
    default:
      return state;
  }
}
