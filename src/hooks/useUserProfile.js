import { useAuth } from '../contexts/AuthContext';

export const useUserProfile = () => {
  const { userProfile, refreshUserProfile, isAdmin, loading, isAuthReady } = useAuth();
  return { userProfile, refreshUserProfile, isAdmin, loading, isAuthReady };
};
