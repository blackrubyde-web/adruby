import { useAuth } from '../contexts/AuthContext';

export const useSubscriptionStatus = () => {
  const { subscriptionStatus, subscriptionMeta, refreshSubscriptionStatus, isSubscribed } = useAuth();
  return { subscriptionStatus, subscriptionMeta, refreshSubscriptionStatus, isSubscribed };
};
