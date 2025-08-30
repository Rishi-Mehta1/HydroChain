import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, Info, X, Zap, Shield, ShoppingCart } from 'lucide-react';

const Toast = ({ 
  id,
  type = 'info', 
  title, 
  message, 
  duration = 5000,
  variant = 'default',
  onClose 
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => onClose?.(id), 300); // Wait for animation to complete
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, id, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose?.(id), 300);
  };

  const getTypeConfig = () => {
    switch (type) {
      case 'success':
        return {
          icon: CheckCircle,
          bgColor: 'bg-green-50 border-green-200',
          iconColor: 'text-green-600',
          titleColor: 'text-green-800',
          messageColor: 'text-green-700'
        };
      case 'error':
        return {
          icon: AlertCircle,
          bgColor: 'bg-red-50 border-red-200',
          iconColor: 'text-red-600',
          titleColor: 'text-red-800',
          messageColor: 'text-red-700'
        };
      case 'warning':
        return {
          icon: AlertCircle,
          bgColor: 'bg-yellow-50 border-yellow-200',
          iconColor: 'text-yellow-600',
          titleColor: 'text-yellow-800',
          messageColor: 'text-yellow-700'
        };
      default: // info
        return {
          icon: Info,
          bgColor: 'bg-blue-50 border-blue-200',
          iconColor: 'text-blue-600',
          titleColor: 'text-blue-800',
          messageColor: 'text-blue-700'
        };
    }
  };

  const getVariantIcon = () => {
    switch (variant) {
      case 'producer':
        return <Zap className="w-5 h-5 text-green-600" />;
      case 'buyer':
        return <ShoppingCart className="w-5 h-5 text-blue-600" />;
      case 'auditor':
        return <Shield className="w-5 h-5 text-purple-600" />;
      default:
        return null;
    }
  };

  const config = getTypeConfig();
  const Icon = config.icon;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: 300, scale: 0.3 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 300, scale: 0.3 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className={`max-w-md w-full ${config.bgColor} border rounded-xl shadow-lg p-4 mb-3`}
        >
          <div className="flex items-start gap-3">
            {/* Icon */}
            <div className="flex-shrink-0 flex items-center gap-2">
              <Icon className={`w-5 h-5 ${config.iconColor}`} />
              {getVariantIcon()}
            </div>
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              {title && (
                <p className={`text-sm font-semibold ${config.titleColor} mb-1`}>
                  {title}
                </p>
              )}
              {message && (
                <p className={`text-sm ${config.messageColor}`}>
                  {message}
                </p>
              )}
            </div>
            
            {/* Close Button */}
            <button
              onClick={handleClose}
              className={`flex-shrink-0 rounded-md p-1.5 hover:bg-white/50 transition-colors ${config.iconColor}`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          {/* Progress Bar */}
          {duration > 0 && (
            <motion.div
              className="mt-3 h-1 bg-white/30 rounded-full overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <motion.div
                className={`h-full ${
                  type === 'success' ? 'bg-green-400' :
                  type === 'error' ? 'bg-red-400' :
                  type === 'warning' ? 'bg-yellow-400' :
                  'bg-blue-400'
                }`}
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: duration / 1000, ease: 'linear' }}
              />
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Toast Container Component
export const ToastContainer = ({ toasts, onRemoveToast }) => {
  return (
    <div className="fixed top-20 right-4 z-50 space-y-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            {...toast}
            onClose={onRemoveToast}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

// Hook for managing toasts
export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const addToast = (toast) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { ...toast, id }]);
    return id;
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const removeAllToasts = () => {
    setToasts([]);
  };

  // Convenient methods for different toast types
  const success = (title, message, options = {}) => {
    return addToast({ type: 'success', title, message, ...options });
  };

  const error = (title, message, options = {}) => {
    return addToast({ type: 'error', title, message, duration: 7000, ...options });
  };

  const warning = (title, message, options = {}) => {
    return addToast({ type: 'warning', title, message, ...options });
  };

  const info = (title, message, options = {}) => {
    return addToast({ type: 'info', title, message, ...options });
  };

  return {
    toasts,
    addToast,
    removeToast,
    removeAllToasts,
    success,
    error,
    warning,
    info
  };
};

export default Toast;
