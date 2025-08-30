import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import BuyerDashboard from './dashboard/BuyerDashboard';
import ProducerDashboard from './dashboard/ProducerDashboard';
import AuditorDashboard from './dashboard/AuditorDashboard';
import { LogOut, User, Shield } from 'lucide-react';

const Dashboard = () => {
  const { role, signOut, user, clearAuthState, loading } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [error, setError] = useState(null);

  // Debug logging
  useEffect(() => {
    console.log('Dashboard mounted with:', { role, user, loading });
  }, [role, user, loading]);

  const handleSignOut = async () => {
    if (isSigningOut) return; // Prevent multiple clicks
    
    setIsSigningOut(true);
    try {
      console.log('Dashboard: Starting signout...');
      
      // Force clear state immediately
      clearAuthState();
      
      const { error } = await signOut();
      if (error) {
        console.error('Error signing out:', error);
        // Even with error, we've cleared the state
      }
      
      console.log('Dashboard: Signout process complete, redirecting...');
      // Force redirect to login
      window.location.href = '/login';
    } catch (error) {
      console.error('Error during signout:', error);
      // Force redirect even on error
      window.location.href = '/login';
    } finally {
      setIsSigningOut(false);
    }
  };

  const renderDashboard = () => {
    console.log('Rendering dashboard for role:', role);
    
    try {
      switch (role) {
        case 'buyer':
          return <BuyerDashboard />;
        case 'producer':
          return <ProducerDashboard />;
        case 'auditor':
          return <AuditorDashboard />;
        default:
          return (
            <div className="flex items-center justify-center min-h-screen">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading dashboard...</p>
                <p className="text-sm text-gray-500 mt-2">Role: {role || 'undefined'}</p>
                <p className="text-sm text-gray-500">User: {user ? 'Logged in' : 'Not logged in'}</p>
              </div>
            </div>
          );
      }
    } catch (error) {
      console.error('Error rendering dashboard:', error);
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="text-red-600 text-xl mb-4">⚠️ Dashboard Error</div>
            <p className="text-gray-600 mb-4">There was an error loading the dashboard.</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'buyer':
        return <User className="w-4 h-4" />;
      case 'producer':
        return <Shield className="w-4 h-4" />;
      case 'auditor':
        return <Shield className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'buyer':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'producer':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'auditor':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Format email for better display
  const formatEmail = (email) => {
    if (!email) return '';
    const [username, domain] = email.split('@');
    if (username.length > 15) {
      return `${username.substring(0, 15)}...@${domain}`;
    }
    return email;
  };

  // Always show something - never return null or undefined
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading authentication...</p>
          <p className="text-sm text-gray-500 mt-2">Please wait...</p>
        </div>
      </div>
    );
  }

  // Show error state if there's an error
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">⚠️ Error Loading Dashboard</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  // Show message if no user
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-yellow-600 text-xl mb-4">🔒 No User Found</div>
          <p className="text-gray-600 mb-4">Please log in to access the dashboard.</p>
          <button 
            onClick={() => window.location.href = '/login'} 
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Main dashboard content
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Test Message */}
      <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-4">
        <p className="font-medium">Dashboard is working! User: {user?.email}, Role: {role}</p>
      </div>
      
      {/* Navigation Header */}
      <nav className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-700 bg-clip-text text-transparent">
                  Green Hydrogen Portal
                </h1>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* User Info */}
              <div className="flex items-center gap-3">
                <div className="text-right min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate max-w-48" title={user?.email}>
                    {formatEmail(user?.email || '')}
                  </p>
                  <div className="flex items-center gap-2">
                    {getRoleIcon(role)}
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getRoleColor(role)}`}>
                      {role?.charAt(0).toUpperCase() + role?.slice(1) || 'Unknown'}
                    </span>
                  </div>
                </div>
                
                {/* Sign Out Button */}
                <button
                  onClick={handleSignOut}
                  disabled={isSigningOut}
                  className="inline-flex items-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {isSigningOut ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Signing out...
                    </>
                  ) : (
                    <>
                      <LogOut className="w-4 h-4" />
                      Sign out
                    </>
                    )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="min-h-screen">
        {renderDashboard()}
      </main>
    </div>
  );
};

export default Dashboard;
