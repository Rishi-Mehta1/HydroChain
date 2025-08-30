import React from 'react';
import { Loader, Zap, Shield, ShoppingCart } from 'lucide-react';

const LoadingSpinner = ({ 
  size = 'md', 
  variant = 'default', 
  message = 'Loading...', 
  fullScreen = false,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8', 
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const getIcon = () => {
    switch (variant) {
      case 'producer':
        return <Zap className={`${sizeClasses[size]} text-green-600 animate-spin`} />;
      case 'buyer':
        return <ShoppingCart className={`${sizeClasses[size]} text-blue-600 animate-spin`} />;
      case 'auditor':
        return <Shield className={`${sizeClasses[size]} text-purple-600 animate-spin`} />;
      default:
        return <Loader className={`${sizeClasses[size]} text-gray-600 animate-spin`} />;
    }
  };

  const getSpinnerColor = () => {
    switch (variant) {
      case 'producer':
        return 'border-green-600';
      case 'buyer':
        return 'border-blue-600';
      case 'auditor':
        return 'border-purple-600';
      default:
        return 'border-gray-600';
    }
  };

  const spinner = (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      {/* Animated Icon */}
      <div className="mb-4">
        {getIcon()}
      </div>
      
      {/* Animated Ring Loader */}
      <div className={`animate-spin rounded-full h-8 w-8 border-b-2 ${getSpinnerColor()} mb-4`}></div>
      
      {/* Loading Message */}
      {message && (
        <p className="text-gray-600 text-sm font-medium">{message}</p>
      )}
      
      {/* Animated Dots */}
      <div className="flex space-x-1 mt-2">
        <div className={`w-2 h-2 ${variant === 'producer' ? 'bg-green-600' : 
                                  variant === 'buyer' ? 'bg-blue-600' : 
                                  variant === 'auditor' ? 'bg-purple-600' : 
                                  'bg-gray-600'} rounded-full animate-bounce`} 
             style={{ animationDelay: '0ms' }}></div>
        <div className={`w-2 h-2 ${variant === 'producer' ? 'bg-green-600' : 
                                  variant === 'buyer' ? 'bg-blue-600' : 
                                  variant === 'auditor' ? 'bg-purple-600' : 
                                  'bg-gray-600'} rounded-full animate-bounce`} 
             style={{ animationDelay: '150ms' }}></div>
        <div className={`w-2 h-2 ${variant === 'producer' ? 'bg-green-600' : 
                                  variant === 'buyer' ? 'bg-blue-600' : 
                                  variant === 'auditor' ? 'bg-purple-600' : 
                                  'bg-gray-600'} rounded-full animate-bounce`} 
             style={{ animationDelay: '300ms' }}></div>
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 flex items-center justify-center z-50">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-12">
          {spinner}
        </div>
      </div>
    );
  }

  return spinner;
};

// Simple inline loading spinner for buttons and small spaces
export const InlineLoader = ({ 
  size = 'sm', 
  variant = 'default', 
  className = '' 
}) => {
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5'
  };

  const getSpinnerColor = () => {
    switch (variant) {
      case 'producer':
        return 'border-green-600';
      case 'buyer':
        return 'border-blue-600';
      case 'auditor':
        return 'border-purple-600';
      case 'white':
        return 'border-white';
      default:
        return 'border-gray-600';
    }
  };

  return (
    <div className={`animate-spin rounded-full border-b-2 ${getSpinnerColor()} ${sizeClasses[size]} ${className}`}></div>
  );
};

// Page-level loading component
export const PageLoader = ({ 
  title = "Loading", 
  subtitle = "Please wait while we fetch your data...",
  variant = 'default'
}) => {
  const getGradient = () => {
    switch (variant) {
      case 'producer':
        return 'from-green-50 via-emerald-50 to-teal-50';
      case 'buyer':
        return 'from-blue-50 via-cyan-50 to-sky-50';
      case 'auditor':
        return 'from-purple-50 via-violet-50 to-indigo-50';
      default:
        return 'from-blue-50 via-cyan-50 to-teal-50';
    }
  };

  return (
    <div className={`min-h-96 bg-gradient-to-br ${getGradient()} flex items-center justify-center p-8`}>
      <div className="text-center">
        <LoadingSpinner size="xl" variant={variant} message="" />
        <h2 className="text-2xl font-bold text-gray-800 mt-6 mb-2">{title}</h2>
        <p className="text-gray-600 max-w-md">{subtitle}</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
