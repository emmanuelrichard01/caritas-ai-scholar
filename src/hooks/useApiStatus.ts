
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
}

export function useApiStatus() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const { data: apiStatus, isLoading, error, refetch } = useQuery({
    queryKey: ['api-status'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase.functions.invoke('api-info');
        
        if (error) {
          throw new Error(error.message || 'Failed to fetch API status');
        }
        
        // Create fallback data structure to ensure our app doesn't crash
        const fallbackData: ApiStatusData = {
          openRouter: {
            available: false,
            error: 'Data unavailable'
          },
          googleAI: {
            available: false,
            status: 'Unknown',
            error: 'Data unavailable'
          }
        };
        
        // If data is null or undefined, use fallback
        if (!data) {
          console.warn('API info returned no data, using fallback');
          return fallbackData;
        }
        
        // If data is available but missing expected properties, merge with fallback
        const processedData: ApiStatusData = {
          openRouter: data.openRouter || fallbackData.openRouter,
          googleAI: data.googleAI || fallbackData.googleAI
        };
        
        return processedData;
      } catch (error) {
        console.error('Error in API status query:', error);
        // Return a working fallback structure even when errors occur
        return {
          openRouter: {
            available: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          },
          googleAI: {
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
