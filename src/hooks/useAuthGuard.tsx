import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export const useAuthGuard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth', { state: { from: location.pathname }, replace: true });
    }
  }, [user, loading, navigate, location.pathname]);

  return {
    isAuthenticated: !!user,
    loading
  };
};
