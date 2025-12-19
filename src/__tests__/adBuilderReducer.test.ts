import { describe, expect, it } from 'vitest';
import {
  adBuilderReducer,
  initialAdBuilderState
} from '../app/components/ad-builder/adBuilderReducer';

describe('adBuilderReducer', () => {
  it('updates a single field', () => {
    const next = adBuilderReducer(initialAdBuilderState, {
      type: 'SET_FIELD',
      field: 'strategyId',
      value: 'ecom_d2c'
    });

    expect(next.formData.strategyId).toBe('ecom_d2c');
  });

  it('moves between steps within bounds', () => {
    const step2 = adBuilderReducer(initialAdBuilderState, { type: 'NEXT_STEP' });
    expect(step2.currentStep).toBe(2);

    const back = adBuilderReducer(step2, { type: 'PREV_STEP' });
    expect(back.currentStep).toBe(1);
  });

  it('loads a draft payload', () => {
    const next = adBuilderReducer(initialAdBuilderState, {
      type: 'LOAD_DRAFT',
      payload: {
        currentStep: 4,
        formData: { productName: 'DraftName' }
      }
    });

    expect(next.currentStep).toBe(4);
    expect(next.formData.productName).toBe('DraftName');
  });
});
