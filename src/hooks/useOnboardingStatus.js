import { useAuth } from '../contexts/AuthContext';

export const useOnboardingStatus = () => {
  const { onboardingStatus, refreshOnboardingStatus, isOnboardingComplete } = useAuth();
  return { onboardingStatus, refreshOnboardingStatus, isOnboardingComplete };
};
