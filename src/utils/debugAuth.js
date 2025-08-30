// Debug utility for authentication issues
import { supabase } from '../lib/supabaseClient';

export const debugAuth = {
  // Log current auth state
  logCurrentState: async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      console.group('🔍 Auth Debug State');
      console.log('Session:', session);
      console.log('User:', session?.user);
      console.log('Access Token:', session?.access_token ? 'Present' : 'Missing');
      console.log('Refresh Token:', session?.refresh_token ? 'Present' : 'Missing');
      console.log('Expires At:', new Date(session?.expires_at * 1000));
      console.log('Error:', error);
      console.groupEnd();
      return { session, error };
    } catch (err) {
      console.error('Error getting session:', err);
      return { session: null, error: err };
    }
  },

  // Check if token is expired
  isTokenExpired: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return true;
      
      const expiresAt = session.expires_at * 1000; // Convert to milliseconds
      const now = Date.now();
      const isExpired = now >= expiresAt;
      
      console.log('Token expiry check:', {
        expiresAt: new Date(expiresAt),
        now: new Date(now),
        isExpired,
        timeUntilExpiry: Math.round((expiresAt - now) / 1000 / 60) + ' minutes'
      });
      
      return isExpired;
    } catch (err) {
      console.error('Error checking token expiry:', err);
      return true;
    }
  },

  // Force refresh session
  refreshSession: async () => {
    try {
      console.log('🔄 Attempting to refresh session...');
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error('Session refresh failed:', error);
        return { success: false, error };
      }
      
      console.log('✅ Session refreshed successfully');
      return { success: true, session: data.session };
    } catch (err) {
      console.error('Session refresh error:', err);
      return { success: false, error: err };
    }
  },

  // Clear all auth data
  clearAllAuthData: () => {
    console.log('🧹 Clearing all auth data...');
    
    // Clear localStorage
    Object.keys(localStorage).forEach(key => {
      if (key.includes('supabase') || key.includes('auth')) {
        localStorage.removeItem(key);
        console.log(`Cleared localStorage: ${key}`);
      }
    });
    
    // Clear sessionStorage
    Object.keys(sessionStorage).forEach(key => {
      if (key.includes('supabase') || key.includes('auth')) {
        sessionStorage.removeItem(key);
        console.log(`Cleared sessionStorage: ${key}`);
      }
    });
    
    console.log('✅ All auth data cleared');
  },

  // Emergency logout - force complete logout and redirect
  emergencyLogout: async () => {
    console.log('🚨 Emergency logout initiated...');
    
    try {
      // Step 1: Try to sign out from Supabase
      await supabase.auth.signOut({ scope: 'global' });
      console.log('Step 1: Supabase signout complete');
    } catch (error) {
      console.warn('Supabase signout failed:', error);
    }
    
    // Step 2: Clear all storage
    try {
      localStorage.clear();
      sessionStorage.clear();
      
      // Clear cookies
      document.cookie.split(";").forEach(function(c) { 
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
      });
      
      console.log('Step 2: All storage cleared');
    } catch (error) {
      console.warn('Storage clearing failed:', error);
    }
    
    // Step 3: Force redirect
    console.log('Step 3: Forcing redirect to login...');
    setTimeout(() => {
      window.location.replace('/login');
    }, 100);
    
    console.log('✅ Emergency logout complete');
  },

  // Test connection to Supabase
  testConnection: async () => {
    try {
      console.log('🔌 Testing Supabase connection...');
      
      // Try to make a simple query
      const { data, error } = await supabase
        .from('user_roles')
        .select('count(*)')
        .limit(1);
      
      if (error && error.code !== 'PGRST116') { // PGRST116 is table not found, which is ok
        console.error('Connection test failed:', error);
        return { connected: false, error };
      }
      
      console.log('✅ Supabase connection successful');
      return { connected: true };
    } catch (err) {
      console.error('Connection test error:', err);
      return { connected: false, error: err };
    }
  },

  // Full diagnostic report
  runDiagnostics: async () => {
    console.group('🏥 Auth Diagnostics Report');
    
    const connectionResult = await debugAuth.testConnection();
    const sessionResult = await debugAuth.logCurrentState();
    const tokenExpired = await debugAuth.isTokenExpired();
    
    console.log('Summary:', {
      connectionOk: connectionResult.connected,
      hasSession: !!sessionResult.session,
      tokenExpired,
      recommendations: [
        !connectionResult.connected ? 'Check internet connection and Supabase config' : null,
        !sessionResult.session ? 'User needs to login' : null,
        tokenExpired ? 'Session expired, refresh needed' : null,
        sessionResult.error ? 'Check auth configuration' : null
      ].filter(Boolean)
    });
    
    console.groupEnd();
    
    return {
      connection: connectionResult,
      session: sessionResult,
      tokenExpired
    };
  }
};

// Add debug functions to window in development
if (process.env.NODE_ENV === 'development') {
  window.debugAuth = debugAuth;
  console.log('🔧 Debug utilities available at window.debugAuth');
}
