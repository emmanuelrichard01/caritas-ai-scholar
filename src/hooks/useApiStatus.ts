
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
    queryFn: async () => {
      try {
        const { data, error } = await supabase.functions.invoke('api-info');
        
        if (error) {
          console.error('Supabase function error:', error);
          throw new Error(error.message || 'Failed to fetch API status');
        }
        
        // Ensure we always return a consistent structure with safe fallbacks
        const safeData: ApiStatusData = {
          openRouter: {
            available: Boolean(data?.openRouter?.available),
            creditsRemaining: data?.openRouter?.creditsRemaining || undefined,
            creditsGranted: data?.openRouter?.creditsGranted || undefined,
            rateLimitRemaining: data?.openRouter?.rateLimitRemaining || undefined,
            rateLimit: data?.openRouter?.rateLimit || undefined,
            error: data?.openRouter?.error || (data?.openRouter?.available ? undefined : 'API key not configured')
          },
          googleAI: {
            available: Boolean(data?.googleAI?.available),
            dailyLimit: data?.googleAI?.dailyLimit || undefined,
            remainingRequests: data?.googleAI?.remainingRequests || undefined,
            status: data?.googleAI?.status || (data?.googleAI?.available ? 'Active' : 'Not Configured'),
            error: data?.googleAI?.error || (data?.googleAI?.available ? undefined : 'API key not configured')
          },
          serperAI: {
            available: Boolean(data?.serperAI?.available),
            monthlyLimit: data?.serperAI?.monthlyLimit || undefined,
            status: data?.serperAI?.status || (data?.serperAI?.available ? 'Active' : 'Not Configured'),
            error: data?.serperAI?.error || (data?.serperAI?.available ? undefined : 'API key not configured')
          }
        };
        
        return safeData;
      } catch (error) {
        console.error('Error in API status query:', error);
        // Return a safe fallback structure on any error
        return {
          openRouter: {
            available: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          },
          googleAI: {
            available: false,
            status: 'Error',
            error: error instanceof Error ? error.message : 'Unknown error'
          },
          serperAI: {
            available: false,
            status: 'Error',
            error: error instanceof Error ? error.message : 'Unknown error'
          }
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
    } catch (error) {
      console.error('Error refreshing API status:', error);
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
