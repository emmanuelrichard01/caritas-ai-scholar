import { useAuthContext } from '@/contexts/AuthContext';

// Re-export useAuth to maintain backward compatibility with existing imports
export const useAuth = () => {
  return useAuthContext();
};

