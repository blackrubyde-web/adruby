import { useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { creditService } from '../services/creditService';

export const useCreditCheck = () => {
  const { user } = useAuth();
  const [showCreditWarning, setShowCreditWarning] = useState(false);
  const [creditCheckData, setCreditCheckData] = useState(null);

  const checkCreditsForAction = useCallback(async (actionType) => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    try {
      const result = await creditService?.checkCreditsForAction(user?.id, actionType);
      
      if (!result?.hasEnoughCredits) {
        setCreditCheckData({
          currentCredits: result?.currentCredits,
          requiredCredits: result?.requiredCredits,
          actionType: actionType,
          shortage: result?.shortage
        });
        setShowCreditWarning(true);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error checking credits:', error);
      throw error;
    }
  }, [user?.id]);

  const deductCreditsForAction = useCallback(async (actionType, description = null) => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    try {
      const result = await creditService?.deductCredits(user?.id, actionType, description);
      
      // Dispatch credit update event to refresh displays
      window.dispatchEvent(new Event('credit-updated'));
      
      return result;
    } catch (error) {
      console.error('Error deducting credits:', error);
      
      if (error?.message?.includes('Insufficient credits')) {
        // Show credit warning modal
        const status = await creditService?.getUserCreditStatus(user?.id);
        const creditCosts = {
          'ad_builder': 8,
          'ai_analysis': 6,
          'ad_strategy': 6,
          'full_process': 20
        };
        
        setCreditCheckData({
          currentCredits: status?.credits,
          requiredCredits: creditCosts?.[actionType],
          actionType: actionType,
          shortage: Math.max(0, creditCosts?.[actionType] - status?.credits)
        });
        setShowCreditWarning(true);
      }
      
      throw error;
    }
  }, [user?.id]);

  const closeCreditWarning = useCallback(() => {
    setShowCreditWarning(false);
    setCreditCheckData(null);
  }, []);

  return {
    checkCreditsForAction,
    deductCreditsForAction,
    showCreditWarning,
    creditCheckData,
    closeCreditWarning
  };
};