import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Force clear all state
  const clearAuthState = () => {
    console.log('Clearing auth state...');
    setUser(null);
    setRole(null);
    setLoading(false);
    setError(null);
  };

  useEffect(() => {
    console.log('AuthContext: useEffect started');
    
    // Check active sessions and set the user
    const getInitialSession = async () => {
      try {
        console.log('AuthContext: Getting initial session...');
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          setError(sessionError.message);
          setLoading(false);
          return;
        }
        
        console.log('Initial session:', session);
        setUser(session?.user ?? null);
        
        // Fetch user role if user exists
        const fetchUserRole = async (userId) => {
          try {
            console.log('Fetching user role for:', userId);
            const { data, error: roleError } = await supabase
              .from('user_roles')
              .select('role')
              .eq('user_id', userId)
              .single();
              
            if (roleError) {
              console.error('Role fetch error:', roleError);
              setRole(null);
            } else {
              console.log('User role:', data?.role);
              setRole(data?.role || null);
            }
          } catch (error) {
            console.error('Error fetching user role:', error);
            setRole(null);
          }
        };

        if (session?.user?.id) {
          await fetchUserRole(session.user.id);
        } else {
          setRole(null);
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
        setError(error.message);
        setUser(null);
        setRole(null);
      } finally {
        console.log('AuthContext: Initial session check complete');
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for changes in auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session);
        
        if (event === 'SIGNED_OUT') {
          // Clear all state when user signs out
          console.log('SIGNED_OUT event detected, clearing state...');
          clearAuthState();
          return;
        }
        
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          const currentUser = session?.user ?? null;
          console.log('Setting user:', currentUser);
          setUser(currentUser);
          
          if (currentUser?.id) {
            try {
              const { data } = await supabase
                .from('user_roles')
                .select('role')
                .eq('user_id', currentUser.id)
                .single();
              setRole(data?.role || null);
            } catch (error) {
              console.error('Error fetching user role:', error);
              setRole(null);
            }
          } else {
            setRole(null);
          }
        }
      }
    );

    return () => {
      console.log('AuthContext: Cleaning up subscription');
      subscription?.unsubscribe();
    };
  }, []);

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
        console.log('AuthContext: Starting signout...');
        
        // Clear state immediately to prevent UI issues
        clearAuthState();
        
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        
        console.log('AuthContext: Signout successful');
        return { error: null };
      } catch (error) {
        console.error('Error signing out:', error);
        // Even if there's an error, we want to clear the state
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
