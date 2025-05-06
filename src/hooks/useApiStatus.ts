
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ApiStatusData {
  openRouter: {
    available: boolean;
    creditsRemaining?: number;
    creditsGranted?: number;
    rateLimitRemaining?: string;
    rateLimit?: string;
    error?: string;
  };
  googleAI: {
    available: boolean;
    dailyLimit?: string;
    remainingRequests?: string;
    status?: string;
    error?: string;
  };
}

export function useApiStatus() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const { data: apiStatus, isLoading, error, refetch } = useQuery({
    queryKey: ['api-status'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('api-info');
      
      if (error) {
        throw new Error(error.message || 'Failed to fetch API status');
      }
      
      return data as ApiStatusData;
    },
    retry: 1,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  const refreshStatus = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  };
  
  return {
    apiStatus,
    isLoading,
    error,
    refreshStatus,
    isRefreshing
  };
}
