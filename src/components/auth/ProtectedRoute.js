import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, role, loading, error } = useAuth();
  const location = useLocation();
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    console.log('ProtectedRoute state:', {
      path: location.pathname,
      user: user ? `${user.email} (${user.id})` : 'null',
      role,
      loading,
      error,
      requiredRole
    });
  }, [user, role, loading, error, requiredRole, location.pathname]);

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-emerald-50 to-green-100">
        <div className="text-center bg-white rounded-2xl p-8 shadow-xl">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600 mb-2">Loading authentication...</p>
          <p className="text-sm text-gray-500">Please wait while we verify your session</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-emerald-50 to-green-100">
        <div className="text-center bg-white rounded-2xl p-8 shadow-xl">
          <div className="text-red-600 text-xl mb-4">⚠️ Authentication Error</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => {
              setRedirecting(true);
              window.location.href = '/login';
            }}
            disabled={redirecting}
            className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
          >
            {redirecting ? 'Redirecting...' : 'Return to Login'}
          </button>
        </div>
      </div>
    );
  }

  // Redirect to login if no user
  if (!user) {
    console.log('No user found, redirecting to login from:', location.pathname);
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role requirements
  if (requiredRole && role !== requiredRole) {
    console.log(`User role '${role}' does not match required role '${requiredRole}', redirecting to unauthorized`);
    return <Navigate to="/unauthorized" state={{ requiredRole, userRole: role }} replace />;
  }

  // If we have a user but no role yet, show loading for role
  if (user && role === null) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-emerald-50 to-green-100">
        <div className="text-center bg-white rounded-2xl p-8 shadow-xl">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600 mb-2">Setting up your dashboard...</p>
          <p className="text-sm text-gray-500">Configuring user permissions</p>
        </div>
      </div>
    );
  }

  console.log('User authenticated successfully, rendering protected content for role:', role);
  return children;
};

export default ProtectedRoute;
