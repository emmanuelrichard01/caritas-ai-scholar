
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

const defaultApiStatus: ApiStatusData = {
  openRouter: { available: false, error: 'Not available' },
  googleAI: { available: false, status: 'Not configured', error: 'Not available' },
  serperAI: { available: false, status: 'Not configured', error: 'Not available' }
};

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
          return defaultApiStatus;
        }
        
        console.log('API status response:', data);
        
        // Safely parse the response with fallbacks
        const safeData = data || {};
        
        return {
          openRouter: {
            available: Boolean(safeData.openRouter?.available),
            creditsRemaining: safeData.openRouter?.creditsRemaining || undefined,
            creditsGranted: safeData.openRouter?.creditsGranted || undefined,
            rateLimitRemaining: safeData.openRouter?.rateLimitRemaining || undefined,
            rateLimit: safeData.openRouter?.rateLimit || undefined,
            error: safeData.openRouter?.error || (safeData.openRouter?.available ? undefined : 'Not configured')
          },
          googleAI: {
            available: Boolean(safeData.googleAI?.available),
            dailyLimit: safeData.googleAI?.dailyLimit || undefined,
            remainingRequests: safeData.googleAI?.remainingRequests || undefined,
            status: safeData.googleAI?.status || 'Not configured',
            error: safeData.googleAI?.error || (safeData.googleAI?.available ? undefined : 'Not configured')
          },
          serperAI: {
            available: Boolean(safeData.serperAI?.available),
            monthlyLimit: safeData.serperAI?.monthlyLimit || undefined,
            status: safeData.serperAI?.status || 'Not configured',
            error: safeData.serperAI?.error || (safeData.serperAI?.available ? undefined : 'Not configured')
          }
        };
      } catch (error) {
        console.error('Error fetching API status:', error);
        return defaultApiStatus;
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
    apiStatus: apiStatus || defaultApiStatus,
    isLoading,
    error,
    refreshStatus,
    isRefreshing
  };
}
