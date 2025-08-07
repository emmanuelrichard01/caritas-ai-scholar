import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

export const useAuthGuard = () => {
  const { user, loading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      setShowAuthModal(true);
    } else if (user) {
      setShowAuthModal(false);
    }
  }, [user, loading]);

  const closeAuthModal = () => {
    setShowAuthModal(false);
  };

  return {
    isAuthenticated: !!user,
    showAuthModal,
    closeAuthModal,
    loading
  };
};