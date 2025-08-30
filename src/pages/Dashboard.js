import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import BuyerDashboard from './dashboard/BuyerDashboard';
import ProducerDashboard from './dashboard/ProducerDashboard';
import AuditorDashboard from './dashboard/AuditorDashboard';
import HydroChainLogo from '../components/layout/HydroChainLogo';
import { 
  LogOut, 
  User, 
  Shield, 
  Leaf, 
  Zap, 
  Sun, 
  Bell,
  Settings,
  HelpCircle,
  Award,
  Factory,
  Building,
  CheckCircle,
  Activity,
  TrendingUp,
  Menu
} from 'lucide-react';

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
    
    console.log('🚪 Dashboard: User initiated signout');
    setIsSigningOut(true);
    
    try {
      // Step 1: Clear auth state immediately to prevent UI issues
      console.log('Step 1: Clearing auth state immediately');
      clearAuthState();
      
      // Step 2: Call the comprehensive signout function
      console.log('Step 2: Calling comprehensive signout');
      await signOut();
      
      // Step 3: Force a complete page reload to ensure clean state
      console.log('Step 3: Forcing page reload for clean state');
      setTimeout(() => {
        // Use location.replace to avoid back button issues
        window.location.replace('/login');
      }, 500); // Small delay to ensure signout completes
      
    } catch (error) {
      console.error('🚨 Dashboard signout error:', error);
      
      // Even on error, force logout by clearing everything and redirecting
      try {
        clearAuthState();
        localStorage.clear();
        sessionStorage.clear();
      } catch (clearError) {
        console.error('Error clearing storage:', clearError);
      }
      
      // Force redirect regardless of errors
      window.location.replace('/login');
    }
    
    // Note: We don't set setIsSigningOut(false) because we're redirecting
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
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
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
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
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
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'producer':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'auditor':
        return 'bg-teal-100 text-teal-800 border-teal-200';
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
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
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
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
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Main dashboard content
  // Get appropriate dashboard icon based on role
  const getDashboardIcon = () => {
    switch (role) {
      case 'buyer':
        return <Leaf className="w-6 h-6" />;
      case 'producer':
        return <Zap className="w-6 h-6" />;
      case 'auditor':
        return <Shield className="w-6 h-6" />;
      default:
        return <User className="w-6 h-6" />;
    }
  };

  // Get role display name
  const getRoleDisplayName = (role) => {
    switch (role) {
      case 'buyer':
        return 'Industry Buyer';
      case 'producer':
        return 'Green Hydrogen Producer';
      case 'auditor':
        return 'Certification Body';
      case 'regulatory':
        return 'Regulatory Authority';
      case 'verifier':
        return 'Government Verifier';
      default:
        return 'Platform User';
    }
  };

  // Get role-specific quick actions
  const getRoleQuickActions = (role) => {
    switch (role) {
      case 'buyer':
        return [
          { label: 'Browse Credits', icon: Leaf, action: () => console.log('Browse Credits') },
          { label: 'View Portfolio', icon: TrendingUp, action: () => console.log('View Portfolio') },
          { label: 'Compliance Report', icon: CheckCircle, action: () => console.log('Compliance') }
        ];
      case 'producer':
        return [
          { label: 'Issue Credits', icon: Zap, action: () => console.log('Issue Credits') },
          { label: 'Production Data', icon: Activity, action: () => console.log('Production') },
          { label: 'Verification Status', icon: Shield, action: () => console.log('Verification') }
        ];
      case 'auditor':
        return [
          { label: 'Audit Queue', icon: CheckCircle, action: () => console.log('Audit Queue') },
          { label: 'Verification Reports', icon: Award, action: () => console.log('Reports') },
          { label: 'Producer Facilities', icon: Building, action: () => console.log('Facilities') }
        ];
      case 'regulatory':
        return [
          { label: 'Market Overview', icon: TrendingUp, action: () => console.log('Market') },
          { label: 'Compliance Monitor', icon: Shield, action: () => console.log('Compliance') },
          { label: 'Policy Settings', icon: Settings, action: () => console.log('Policy') }
        ];
      case 'verifier':
        return [
          { label: 'Pending Verifications', icon: CheckCircle, action: () => console.log('Verifications') },
          { label: 'Audit Requests', icon: Award, action: () => console.log('Audits') },
          { label: 'System Integrity', icon: Shield, action: () => console.log('Integrity') }
        ];
      default:
        return [];
    }
  };

  // Get welcome message based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-100">
      {/* Enhanced Navigation Header */}
      <nav className="bg-white/90 backdrop-blur-md shadow-lg border-b border-emerald-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20">
            {/* Left Section - Logo and Brand */}
            <div className="flex items-center">
              <div className="flex items-center gap-4">
                <HydroChainLogo size="small" />
                <div className="hidden sm:block">
                  <p className="text-xs text-gray-500 font-medium">Green Hydrogen Credit System</p>
                </div>
              </div>
              
              {/* Role-specific Quick Actions */}
              <div className="hidden lg:flex items-center gap-2 ml-8">
                {getRoleQuickActions(role).map((action, index) => {
                  const ActionIcon = action.icon;
                  return (
                    <button
                      key={index}
                      onClick={action.action}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 transition-all duration-200 text-sm font-medium"
                      title={action.label}
                    >
                      <ActionIcon className="w-4 h-4" />
                      <span className="hidden xl:block">{action.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            
            {/* Right Section - User Info and Actions */}
            <div className="flex items-center gap-4">
              {/* Notifications */}
              <button className="relative p-2 rounded-lg text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 transition-all duration-200">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-xs text-white font-bold">3</span>
                </span>
              </button>
              
              {/* Settings */}
              <button className="p-2 rounded-lg text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 transition-all duration-200">
                <Settings className="w-5 h-5" />
              </button>
              
              {/* Help */}
              <button className="p-2 rounded-lg text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 transition-all duration-200">
                <HelpCircle className="w-5 h-5" />
              </button>
              
              {/* User Profile Section */}
              <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-800 truncate max-w-48" title={user?.email}>
                    {formatEmail(user?.email || '')}
                  </p>
                  <div className="flex items-center justify-end gap-1 mt-1">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${getRoleColor(role)} border shadow-sm`}>
                      {getDashboardIcon()}
                      <span className="ml-1.5">{getRoleDisplayName(role)}</span>
                    </span>
                  </div>
                </div>
                
                {/* User Avatar */}
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full flex items-center justify-center shadow-md">
                    <span className="text-white font-bold text-sm">
                      {user?.email?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                </div>
                
                {/* Sign Out Button */}
                <button
                  onClick={handleSignOut}
                  disabled={isSigningOut}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-semibold rounded-lg text-white bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg"
                >
                  {isSigningOut ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Signing out...
                    </>
                  ) : (
                    <>
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign out
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Mobile Quick Actions Bar */}
        <div className="lg:hidden border-t border-emerald-50 bg-white/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex justify-start gap-1 py-2 overflow-x-auto">
              {getRoleQuickActions(role).map((action, index) => {
                const ActionIcon = action.icon;
                return (
                  <button
                    key={index}
                    onClick={action.action}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 transition-all duration-200 text-xs font-medium whitespace-nowrap"
                  >
                    <ActionIcon className="w-4 h-4" />
                    <span>{action.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Welcome Header */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 mb-6 shadow-sm border border-white/70">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{getGreeting()}, {user?.email?.split('@')[0] || 'User'}</h2>
              <p className="text-gray-600">Welcome to the Blockchain-Based Green Hydrogen Credit System</p>
            </div>
            <div className="hidden md:block">
              <div className="flex space-x-2">
                <div className="p-3 bg-emerald-50 rounded-xl">
                  <Leaf className="w-6 h-6 text-emerald-600" />
                </div>
                <div className="p-3 bg-amber-50 rounded-xl">
                  <Zap className="w-6 h-6 text-amber-500" />
                </div>
                <div className="p-3 bg-lime-50 rounded-xl">
                  <Sun className="w-6 h-6 text-yellow-500" />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Dashboard Content */}
        <div className="px-4 py-4 sm:px-0">
          {renderDashboard()}
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-white/60 backdrop-blur-sm border-t border-gray-100 mt-12">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center">
            <HydroChainLogo size="small" variant="icon" />
            <span className="ml-2 text-sm font-medium text-gray-700">HydroChain</span>
          </div>
            <p className="mt-2 md:mt-0 text-xs text-gray-500">
              &copy; {new Date().getFullYear()} HydroChain. All rights reserved.
            </p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <a href="#" className="text-xs text-gray-500 hover:text-emerald-600">Terms</a>
              <a href="#" className="text-xs text-gray-500 hover:text-emerald-600">Privacy</a>
              <a href="#" className="text-xs text-gray-500 hover:text-emerald-600">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
