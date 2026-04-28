import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { APP_CONFIG } from '@/config/app';

interface University {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  primary_color: string;
  domain: string | null;
  country: string;
  settings: Record<string, any>;
}

export const useUniversity = () => {
  const { profile } = useAuth();

  const { data: university, isLoading, error } = useQuery({
    queryKey: ['university', profile?.university_id],
    queryFn: async (): Promise<University | null> => {
      // If user is not logged in or has no university assigned, return default
      if (!profile?.university_id) {
        return {
          id: 'default',
          name: APP_CONFIG.university.name,
          slug: APP_CONFIG.university.slug,
          logo_url: null,
          primary_color: '#dc2626',
          domain: null,
          country: 'NG',
          settings: {}
        };
      }

      const { data, error } = await supabase
        .from('universities')
        .select('*')
        .eq('id', profile.university_id)
        .single();

      if (error) {
        console.error('Error fetching university:', error);
        throw error;
      }

      return data as University;
    },
    // Don't fetch if we don't have a profile yet (unless they're logged out, in which case we return default immediately)
    enabled: true,
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
  });

  return {
    university: university || {
      id: 'default',
      name: APP_CONFIG.university.name,
      slug: APP_CONFIG.university.slug,
      logo_url: null,
      primary_color: '#dc2626',
      domain: null,
      country: 'NG',
      settings: {}
    },
    isLoading,
    error
  };
};
