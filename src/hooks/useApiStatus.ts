
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ApiStatusData {
  openRouter?: {
    available: boolean;
    creditsRemaining?: number;
    creditsGranted?: number;
    rateLimitRemaining?: string;
    rateLimit?: string;
    error?: string;
  };
  googleAI?: {
    available: boolean;
    dailyLimit?: string;
    remainingRequests?: string;
    status?: string;
    error?: string;
  };
  serperAI?: {
    available: boolean;
    monthlyLimit?: string;
    status?: string;
    error?: string;
  };
}

export function useApiStatus() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const { data: apiStatus, isLoading, error, refetch } = useQuery({
    queryKey: ['api-status'],
    queryFn: async (): Promise<ApiStatusData> => {
      try {
        console.log('Fetching API status...');
        const { data, error } = await supabase.functions.invoke('api-info');
        
        if (error) {
          console.error('Supabase function error:', error);
          throw new Error('Failed to fetch API status');
        }
        
        console.log('API status data received:', data);
        
        // Return safe default structure
        return {
          openRouter: {
            available: Boolean(data?.openRouter?.available),
            creditsRemaining: data?.openRouter?.creditsRemaining,
            creditsGranted: data?.openRouter?.creditsGranted,
            rateLimitRemaining: data?.openRouter?.rateLimitRemaining,
            rateLimit: data?.openRouter?.rateLimit,
            error: data?.openRouter?.error
          },
          googleAI: {
            available: Boolean(data?.googleAI?.available),
            dailyLimit: data?.googleAI?.dailyLimit,
            remainingRequests: data?.googleAI?.remainingRequests,
            status: data?.googleAI?.status || 'Not Configured',
            error: data?.googleAI?.error
          },
          serperAI: {
            available: Boolean(data?.serperAI?.available),
            monthlyLimit: data?.serperAI?.monthlyLimit,
            status: data?.serperAI?.status || 'Not Configured',
            error: data?.serperAI?.error
          }
        };
      } catch (error) {
        console.error('Error fetching API status:', error);
        // Return safe fallback
        return {
          openRouter: { available: false, error: 'Connection error' },
          googleAI: { available: false, status: 'Error', error: 'Connection error' },
          serperAI: { available: false, status: 'Error', error: 'Connection error' }
        };
      }
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
    apiStatus: apiStatus || {
      openRouter: { available: false, error: 'Loading...' },
      googleAI: { available: false, status: 'Loading...', error: 'Loading...' },
      serperAI: { available: false, status: 'Loading...', error: 'Loading...' }
    },
    isLoading,
    error,
    refreshStatus,
    isRefreshing
  };
}
