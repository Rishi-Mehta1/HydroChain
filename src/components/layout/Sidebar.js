import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  BarChart3,
  FileText,
  Users,
  Settings,
  Menu,
  X,
  Leaf,
  TrendingUp,
  Shield,
  Package,
  Activity
} from 'lucide-react';

const Sidebar = ({ userRole = 'producer' }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();

  const getMenuItems = () => {
    const commonItems = [
      { path: '/dashboard', label: 'Dashboard', icon: Home },
      { path: '/transactions', label: 'Transactions', icon: FileText },
    ];

    switch (userRole) {
      case 'producer':
        return [
          ...commonItems,
          { path: '/issue-credits', label: 'Issue Credits', icon: Leaf },
          { path: '/facilities', label: 'Facilities', icon: Package },
          { path: '/analytics', label: 'Analytics', icon: BarChart3 },
          { path: '/verification', label: 'Verification', icon: Shield },
        ];
      case 'buyer':
        return [
          ...commonItems,
          { path: '/browse-credits', label: 'Browse Credits', icon: TrendingUp },
          { path: '/compliance', label: 'Compliance', icon: Shield },
          { path: '/portfolio', label: 'Portfolio', icon: Package },
          { path: '/analytics', label: 'Analytics', icon: BarChart3 },
        ];
      case 'regulator':
        return [
          ...commonItems,
          { path: '/audit', label: 'Audit Log', icon: Shield },
          { path: '/verification', label: 'Verification', icon: Activity },
          { path: '/analytics', label: 'Analytics', icon: BarChart3 },
          { path: '/users', label: 'Users', icon: Users },
        ];
      default:
        return commonItems;
    }
  };

  const menuItems = getMenuItems();

  const sidebarVariants = {
    expanded: { width: '16rem' },
    collapsed: { width: '5rem' },
  };

  const linkVariants = {
    expanded: { justifyContent: 'flex-start' },
    collapsed: { justifyContent: 'center' },
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg"
      >
        {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={isCollapsed ? 'collapsed' : 'expanded'}
        variants={sidebarVariants}
        className={`
          fixed lg:sticky top-0 left-0 h-screen bg-white dark:bg-gray-800 
          border-r border-gray-200 dark:border-gray-700 z-40
          transition-all duration-300 ease-in-out
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <motion.div
                animate={{ opacity: isCollapsed ? 0 : 1 }}
                transition={{ duration: 0.2 }}
                className={`${isCollapsed ? 'hidden' : 'flex items-center space-x-2'}`}
              >
                <Leaf className="w-8 h-8 text-green-500" />
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    H2 Credits
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {userRole.charAt(0).toUpperCase() + userRole.slice(1)} Portal
                  </p>
                </div>
              </motion.div>
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="hidden lg:block p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <Menu size={20} />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 overflow-y-auto">
            <ul className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;

                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      onClick={() => setIsMobileOpen(false)}
                      className={`
                        flex items-center px-3 py-2 rounded-lg transition-colors
                        ${isActive
                          ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                          : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                        }
                      `}
                    >
                      <motion.div
                        animate={isCollapsed ? 'collapsed' : 'expanded'}
                        variants={linkVariants}
                        className="flex items-center w-full"
                      >
                        <Icon size={20} className="flex-shrink-0" />
                        <AnimatePresence>
                          {!isCollapsed && (
                            <motion.span
                              initial={{ opacity: 0, width: 0 }}
                              animate={{ opacity: 1, width: 'auto' }}
                              exit={{ opacity: 0, width: 0 }}
                              transition={{ duration: 0.2 }}
                              className="ml-3 whitespace-nowrap"
                            >
                              {item.label}
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Settings */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <Link
              to="/settings"
              onClick={() => setIsMobileOpen(false)}
              className="flex items-center px-3 py-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <motion.div
                animate={isCollapsed ? 'collapsed' : 'expanded'}
                variants={linkVariants}
                className="flex items-center w-full"
              >
                <Settings size={20} className="flex-shrink-0" />
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                      className="ml-3 whitespace-nowrap"
                    >
                      Settings
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            </Link>
          </div>
        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;
