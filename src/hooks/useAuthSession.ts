import { useState, useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import type { AppUser } from '@/types/auth';

interface AuthSessionState {
  user: AppUser | null;
  session: Session | null;
  loading: boolean;
  rememberMe: boolean;
}

interface AuthSessionActions {
  signOut: () => Promise<void>;
  setRememberMe: (remember: boolean) => void;
  refreshSession: () => Promise<void>;
}

export function useAuthSession(): AuthSessionState & AuthSessionActions {
  const [user, setUser] = useState<AppUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [rememberMe, setRememberMeState] = useState(false);

  // Load remember me preference from localStorage
  useEffect(() => {
    const savedRememberMe = localStorage.getItem('alina_remember_me') === 'true';
    setRememberMeState(savedRememberMe);
  }, []);

  const setRememberMe = useCallback((remember: boolean) => {
    setRememberMeState(remember);
    localStorage.setItem('alina_remember_me', remember.toString());
    
    // Update session persistence
    if (remember) {
      // Extend session timeout for remember me
      localStorage.setItem('alina_extended_session', 'true');
    } else {
      // Clear extended session
      localStorage.removeItem('alina_extended_session');
    }
  }, []);

  const fetchUserProfile = useCallback(async (authUser: User): Promise<AppUser | null> => {
    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', authUser.id)
        .single();

      if (profileError || !profile) {
        console.error('Error fetching user profile:', profileError);
        return null;
      }

      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', authUser.id)
        .single();

      if (roleError || !roleData) {
        console.error('Error fetching user role:', roleError);
        return null;
      }

      return {
        id: authUser.id,
        email: authUser.email || '',
        name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'User',
        role: roleData.role,
        apprenticeship: profile.apprenticeship || ''
      };
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      return null;
    }
  }, []);

  const handleAuthStateChange = useCallback(async (event: string, session: Session | null) => {
    setSession(session);
    
    if (session?.user) {
      // Defer profile fetching to avoid recursion
      setTimeout(async () => {
        const userProfile = await fetchUserProfile(session.user);
        setUser(userProfile);
        setLoading(false);
      }, 0);
    } else {
      setUser(null);
      setLoading(false);
    }

    // Handle session events
    if (event === 'SIGNED_OUT') {
      // Clear extended session on sign out
      localStorage.removeItem('alina_extended_session');
      
      // Broadcast logout event to other tabs
      window.dispatchEvent(new CustomEvent('auth-logout'));
    } else if (event === 'SIGNED_IN') {
      // Broadcast login event to other tabs
      window.dispatchEvent(new CustomEvent('auth-login'));
    }
  }, [fetchUserProfile]);

  const refreshSession = useCallback(async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) throw error;
      
      setSession(data.session);
      if (data.session?.user) {
        const userProfile = await fetchUserProfile(data.session.user);
        setUser(userProfile);
      }
    } catch (error) {
      console.error('Error refreshing session:', error);
    }
  }, [fetchUserProfile]);

  const signOut = useCallback(async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Clear all local storage items related to auth
      localStorage.removeItem('alina_extended_session');
      if (!rememberMe) {
        localStorage.removeItem('alina_remember_me');
      }
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setLoading(false);
    }
  }, [rememberMe]);

  // Setup auth state listener and initial session check
  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange);

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleAuthStateChange('INITIAL_SESSION', session);
    });

    // Handle cross-tab auth events
    const handleAuthEvent = (event: CustomEvent) => {
      if (event.type === 'auth-logout') {
        setUser(null);
        setSession(null);
      }
    };

    window.addEventListener('auth-logout', handleAuthEvent as EventListener);
    window.addEventListener('auth-login', handleAuthEvent as EventListener);

    // Cleanup
    return () => {
      subscription.unsubscribe();
      window.removeEventListener('auth-logout', handleAuthEvent as EventListener);
      window.removeEventListener('auth-login', handleAuthEvent as EventListener);
    };
  }, [handleAuthStateChange]);

  // Auto-refresh session for extended sessions
  useEffect(() => {
    if (!session || !rememberMe) return;

    const refreshInterval = setInterval(() => {
      const isExtended = localStorage.getItem('alina_extended_session') === 'true';
      if (isExtended) {
        refreshSession();
      }
    }, 30 * 60 * 1000); // Refresh every 30 minutes

    return () => clearInterval(refreshInterval);
  }, [session, rememberMe, refreshSession]);

  return {
    user,
    session,
    loading,
    rememberMe,
    signOut,
    setRememberMe,
    refreshSession
  };
}