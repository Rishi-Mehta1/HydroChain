import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Sun, Moon, User, LogOut, ChevronDown, Search, Menu, X, Settings } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import simpleCreditsService from '../../services/simpleCreditsService';
import realtimeService from '../../services/realtimeService';

const Navbar = ({ user: propUser }) => {
  const { user: authUser, signOut, role } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const { isDarkMode, toggleDarkMode } = useTheme();
  
  // Use auth user or prop user
  const user = authUser || propUser;

  useEffect(() => {
    loadNotifications();
    setupRealtimeNotifications();

    return () => {
      // Cleanup realtime subscriptions if needed
    };
  }, [user]);

  const loadNotifications = async () => {
    // Mock notifications for now - could be replaced with real API call
    const mockNotifications = [
      {
        id: 1,
        title: 'System Update',
        message: 'Dashboard has been updated with new features',
        time: new Date(Date.now() - 5 * 60 * 1000).toLocaleString(),
        unread: true,
        type: 'system'
      },
      {
        id: 2,
        title: 'Welcome to HydroChain',
        message: 'Start by exploring the dashboard features',
        time: new Date(Date.now() - 60 * 60 * 1000).toLocaleString(),
        unread: true,
        type: 'welcome'
      }
    ];
    setNotifications(mockNotifications);
  };

  const setupRealtimeNotifications = async () => {
    try {
      await realtimeService.initialize();
      // Subscribe to realtime updates for notifications
      await realtimeService.subscribeToUserUpdates((update) => {
        // Add new notification based on update
        if (update.type === 'credits' && update.action === 'insert') {
          addNotification({
            title: 'New Credit Issued',
            message: `Credit #${update.data.token_id || update.data.id} has been issued`,
            type: 'credit_issued'
          });
        } else if (update.type === 'transactions') {
          addNotification({
            title: `Credit ${update.data.type}`,
            message: `Transaction completed for ${update.data.volume} kg H₂`,
            type: 'transaction'
          });
        }
      });
    } catch (error) {
      console.error('Error setting up realtime notifications:', error);
    }
  };

  const addNotification = (notification) => {
    const newNotification = {
      id: Date.now(),
      ...notification,
      time: new Date().toLocaleString(),
      unread: true
    };
    setNotifications(prev => [newNotification, ...prev.slice(0, 9)]); // Keep only 10 notifications
  };

  const handleSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowSearch(false);
      return;
    }

    setLoading(true);
    try {
      // Search credits by token_id or description
      const results = await simpleCreditsService.searchCredits({
        status: ['issued', 'transferred', 'retired'],
        // Add search functionality to service if not exists
      });
      
      // Filter results based on query
      const filteredResults = results.filter(credit => 
        credit.token_id?.toLowerCase().includes(query.toLowerCase()) ||
        credit.metadata?.description?.toLowerCase().includes(query.toLowerCase())
      );
      
      setSearchResults(filteredResults.slice(0, 5)); // Show top 5 results
      setShowSearch(true);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const markNotificationAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, unread: false }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, unread: false }))
    );
  };

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <motion.nav 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="sticky top-0 z-30 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-700"
    >
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3 sm:gap-6">
          {/* Search Bar - responsive width */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="flex-1 max-w-xs sm:max-w-md lg:max-w-lg xl:max-w-xl"
          >
            <div className="relative group">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="relative"
              >
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors duration-200" size={18} />
                <input
                  type="text"
                  placeholder="Search credits..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    handleSearch(e.target.value);
                  }}
                  className="w-full pl-9 pr-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 hover:shadow-sm"
                />
              </motion.div>
            </div>
          </motion.div>

          {/* Right Section - better spacing and responsive */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="flex items-center space-x-1 sm:space-x-2 lg:space-x-4 flex-shrink-0"
          >
            {/* Dark Mode Toggle */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleDarkMode}
              className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </motion.button>

            {/* Notifications */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Notifications"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-medium">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </motion.button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
                  >
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Notifications
                      </h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors ${
                            notification.unread ? 'bg-emerald-50 dark:bg-emerald-900/20' : ''
                          }`}
                        >
                          <div className="flex items-start">
                            <div className="flex-1">
                              <p className="font-medium text-gray-900 dark:text-white">
                                {notification.title}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                                {notification.time}
                              </p>
                            </div>
                            {notification.unread && (
                              <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2"></div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="p-3 text-center border-t border-gray-200 dark:border-gray-700">
                      <button className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 text-sm font-medium">
                        View all notifications
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowProfile(!showProfile)}
                className="flex items-center space-x-2 p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title={user?.name || 'User menu'}
              >
                <img
                  src={user?.avatar || 'https://ui-avatars.com/api/?name=User&background=10b981&color=fff'}
                  alt={user?.name || 'User'}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full ring-2 ring-emerald-100 dark:ring-emerald-800"
                />
                <div className="hidden lg:block text-left min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-24">
                    {user?.name || 'User Name'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {user?.role || 'Role'}
                  </p>
                </div>
                <ChevronDown size={14} className="text-gray-500 hidden sm:block" />
              </motion.button>

              <AnimatePresence>
                {showProfile && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
                  >
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {user?.name || 'User Name'}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {user?.email || 'user@example.com'}
                      </p>
                    </div>
                    <div className="p-2">
                      <button className="w-full flex items-center space-x-3 px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                        <User size={16} />
                        <span className="text-sm">Profile</span>
                      </button>
                      <button 
                        onClick={handleSignOut}
                        className="w-full flex items-center space-x-3 px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        <LogOut size={16} />
                        <span className="text-sm">Logout</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
