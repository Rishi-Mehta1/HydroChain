import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import '../utils/debugAuth'; // Import debug utilities

export const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [initialized, setInitialized] = useState(false);
  const authStateRef = useRef({ user: null, role: null });

  // Force clear all state
  const clearAuthState = useCallback(() => {
    console.log('🧹 Clearing all auth state...');
    setUser(null);
    setRole(null);
    setError(null);
    setLoading(false);
    authStateRef.current = { user: null, role: null };
    
    // Also clear any stored session data
    try {
      localStorage.removeItem('supabase.auth.token');
      sessionStorage.clear();
      console.log('✅ Storage cleared');
    } catch (error) {
      console.warn('Storage clear error:', error);
    }
  }, []);

  // Fetch user role helper function
  const fetchUserRole = useCallback(async (userId) => {
    if (!userId) {
      setRole(null);
      return null;
    }

    try {
      console.log('Fetching user role for:', userId);
      const { data, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single();
        
      if (roleError) {
        console.warn('Role fetch error (this is normal for new users):', roleError.message);
        // Set default role for users without specific roles
        const defaultRole = 'buyer'; // Default to industry buyer role
        console.log('Setting default role:', defaultRole);
        setRole(defaultRole);
        return defaultRole;
      } else {
        console.log('User role found:', data?.role);
        const userRole = data?.role || 'buyer';
        
        // Validate role against allowed roles
        const allowedRoles = ['buyer', 'producer', 'auditor', 'regulatory', 'verifier'];
        const validRole = allowedRoles.includes(userRole) ? userRole : 'buyer';
        
        setRole(validRole);
        return validRole;
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
      const defaultRole = 'buyer';
      setRole(defaultRole);
      return defaultRole;
    }
  }, []);

  useEffect(() => {
    if (initialized) return; // Prevent double initialization
    
    console.log('AuthContext: Initializing authentication...');
    
    // Add timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      console.warn('Auth initialization timeout reached, forcing completion');
      setLoading(false);
      setInitialized(true);
      setError('Authentication check timed out. Please try refreshing the page.');
    }, 10000); // 10 second timeout
    
    // Check active sessions and set the user
    const getInitialSession = async () => {
      try {
        setLoading(true);
        console.log('AuthContext: Getting initial session...');
        
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          setError(sessionError.message);
          setUser(null);
          setRole(null);
          setLoading(false);
          setInitialized(true);
          clearTimeout(timeoutId);
          return;
        }
        
        console.log('Initial session:', session ? 'Found' : 'Not found');
        
        if (session?.user) {
          setUser(session.user);
          authStateRef.current.user = session.user;
          try {
            await fetchUserRole(session.user.id);
          } catch (roleError) {
            console.warn('Role fetch failed, using default:', roleError);
            setRole('buyer'); // Set default role if fetch fails
          }
        } else {
          setUser(null);
          setRole(null);
          authStateRef.current = { user: null, role: null };
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
        setError(error.message);
        setUser(null);
        setRole(null);
      } finally {
        console.log('AuthContext: Initial session check complete');
        setLoading(false);
        setInitialized(true);
        clearTimeout(timeoutId);
      }
    };

    getInitialSession();
  }, [initialized, fetchUserRole]);

  useEffect(() => {
    if (!initialized) return;
    
    console.log('AuthContext: Setting up auth state listener...');
    
    // Listen for changes in auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session ? 'Session exists' : 'No session');
        
        // Prevent duplicate processing
        if (event === 'SIGNED_OUT' || !session) {
          console.log('SIGNED_OUT or no session, clearing state...');
          clearAuthState();
          return;
        }
        
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          const currentUser = session?.user;
          if (currentUser && currentUser.id !== authStateRef.current.user?.id) {
            console.log('New user authenticated:', currentUser.email);
            setUser(currentUser);
            authStateRef.current.user = currentUser;
            await fetchUserRole(currentUser.id);
          }
        }
      }
    );

    return () => {
      console.log('AuthContext: Cleaning up auth listener');
      subscription?.unsubscribe();
    };
  }, [initialized, clearAuthState, fetchUserRole]);

  const value = {
    signUp: async (data) => {
      const { data: authData, error } = await supabase.auth.signUp(data);
      return { user: authData.user, error };
    },
    signIn: async (data) => {
      const { data: authData, error } = await supabase.auth.signInWithPassword(data);
      return { user: authData.user, error };
    },
    signOut: async () => {
      try {
        console.log('🚪 AuthContext: Starting comprehensive signout...');
        
        // First, clear local state immediately
        console.log('Step 1: Clearing local state...');
        clearAuthState();
        
        // Then sign out from Supabase
        console.log('Step 2: Signing out from Supabase...');
        const { error } = await supabase.auth.signOut({ scope: 'global' });
        
        if (error) {
          console.error('Supabase signout error:', error);
          // Continue with cleanup even if Supabase signout fails
        }
        
        // Clear all possible storage locations
        console.log('Step 3: Clearing all storage...');
        try {
          // Clear localStorage items that might contain auth data
          Object.keys(localStorage).forEach(key => {
            if (key.includes('supabase') || key.includes('auth') || key.includes('session')) {
              localStorage.removeItem(key);
              console.log(`Cleared localStorage: ${key}`);
            }
          });
          
          // Clear sessionStorage
          sessionStorage.clear();
          console.log('Session storage cleared');
          
          // Clear any cookies (if any)
          document.cookie.split(";").forEach(function(c) { 
            document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
          });
          
        } catch (storageError) {
          console.warn('Storage clearing error:', storageError);
        }
        
        console.log('✅ AuthContext: Complete signout successful');
        return { error: null };
      } catch (error) {
        console.error('Critical signout error:', error);
        // Even if there's an error, we want to clear everything
        clearAuthState();
        return { error };
      }
    },
    clearAuthState, // Expose this for manual clearing if needed
    user,
    role,
    loading,
    error,
  };

  console.log('AuthContext: Rendering with state:', { user, role, loading, error });

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
