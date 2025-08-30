import React from 'react';

const HydroChainLogo = ({ 
  size = 'medium', 
  showText = true, 
  className = '',
  variant = 'full' // 'full', 'icon', 'favicon'
}) => {
  
  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return showText ? 'h-6 sm:h-8' : 'h-4 sm:h-6';
      case 'large':
        return showText ? 'h-12 sm:h-16 md:h-20' : 'h-8 sm:h-12 md:h-16';
      case 'xlarge':
        return showText ? 'h-16 sm:h-20 md:h-24 lg:h-32' : 'h-12 sm:h-16 md:h-20 lg:h-24';
      default: // medium
        return showText ? 'h-8 sm:h-10 md:h-12' : 'h-6 sm:h-8 md:h-10';
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'small':
        return 'text-sm sm:text-lg';
      case 'large':
        return 'text-xl sm:text-2xl md:text-3xl';
      case 'xlarge':
        return 'text-2xl sm:text-3xl md:text-4xl lg:text-5xl';
      default: // medium
        return 'text-base sm:text-xl md:text-2xl';
    }
  };

  // Simplified favicon version
  if (variant === 'favicon') {
    return (
      <div className={`inline-flex items-center ${className}`}>
        <img 
          src="/mainlogo.gif" 
          alt="HydroChain Logo" 
          className={`${getSizeClasses()} object-contain`}
        />
      </div>
    );
  }

  // Icon only version
  if (variant === 'icon' || !showText) {
    return (
      <div className={`inline-flex items-center ${className}`}>
        <img 
          src="/mainlogo.gif" 
          alt="HydroChain Logo" 
          className={`${getSizeClasses()} object-contain`}
        />
      </div>
    );
  }

  // Full logo with text
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <img 
        src="/mainlogo.gif" 
        alt="HydroChain Logo" 
        className={`${getSizeClasses()} object-contain`}
      />
      
      {showText && (
        <h1 className={`${getTextSize()} font-bold bg-gradient-to-r from-emerald-600 to-green-700 bg-clip-text text-transparent`}>
          HydroChain
        </h1>
      )}
    </div>
  );
};

export default HydroChainLogo;
