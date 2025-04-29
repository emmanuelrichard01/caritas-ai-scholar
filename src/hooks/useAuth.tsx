
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { UserProfile } from '@/types/auth';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Use setTimeout to prevent potential deadlocks with Supabase client
        if (session?.user) {
          setTimeout(() => {
            fetchProfile(session.user.id);
          }, 0);
        } else {
          setProfile(null);
        }
        
        // Handle auth events - only show toast on signout to avoid duplicate messages
        if (event === 'SIGNED_OUT') {
          // Clear user data and notify
          toast.info('You have been signed out');
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      
      setLoading(false);
    }).catch(error => {
      console.error('Error checking auth session:', error);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }
      
      setProfile(data);
      
      // If profile doesn't exist, create one
      if (!data) {
        await createDefaultProfile(userId);
      }
    } catch (error) {
      console.error('Error in profile fetch operation:', error);
    }
  };

  const createDefaultProfile = async (userId: string) => {
    try {
      const userData = user;
      if (!userData) return;
      
      const { error } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          full_name: userData.user_metadata.full_name || userData.email?.split('@')[0],
          avatar_url: userData.user_metadata.avatar_url || null
        });
        
      if (error) throw error;
      
      // Re-fetch profile after creation
      fetchProfile(userId);
    } catch (error) {
      console.error('Error creating default profile:', error);
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
        }
      });
      
      if (error) throw error;
      // No success toast here since we redirect to Google
    } catch (error: any) {
      toast.error(`Error signing in with Google: ${error.message || 'Unknown error'}`);
      console.error('Error:', error);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Navigate after successful sign-out
      navigate('/auth');
    } catch (error: any) {
      toast.error(`Error signing out: ${error.message || 'Unknown error'}`);
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = () => {
    if (user) {
      fetchProfile(user.id);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      if (!user) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);
        
      if (error) throw error;
      
      toast.success('Profile updated successfully');
      refreshProfile();
    } catch (error: any) {
      toast.error(`Error updating profile: ${error.message || 'Unknown error'}`);
      console.error('Error updating profile:', error);
    }
  };

  return {
    user,
    session,
    profile,
    loading,
    signInWithGoogle,
    signOut,
    refreshProfile,
    updateProfile
  };
};
