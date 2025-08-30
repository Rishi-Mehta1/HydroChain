import React from 'react';
import { motion } from 'framer-motion';
import { InlineLoader } from '../common/LoadingSpinner';

const AnimatedButton = ({ 
  children, 
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon: Icon,
  iconPosition = 'left',
  fullWidth = false,
  onClick,
  className = '',
  glowing = false,
  ...props 
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600';
      case 'producer':
        return 'bg-green-600 hover:bg-green-700 text-white border-green-600';
      case 'buyer':
        return 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600';
      case 'auditor':
        return 'bg-purple-600 hover:bg-purple-700 text-white border-purple-600';
      case 'secondary':
        return 'bg-gray-600 hover:bg-gray-700 text-white border-gray-600';
      case 'outline':
        return 'bg-transparent hover:bg-gray-50 text-gray-700 border-gray-300 hover:border-gray-400';
      case 'outline-producer':
        return 'bg-transparent hover:bg-green-50 text-green-600 border-green-600 hover:border-green-700';
      case 'outline-buyer':
        return 'bg-transparent hover:bg-blue-50 text-blue-600 border-blue-600 hover:border-blue-700';
      case 'outline-auditor':
        return 'bg-transparent hover:bg-purple-50 text-purple-600 border-purple-600 hover:border-purple-700';
      case 'ghost':
        return 'bg-transparent hover:bg-gray-100 text-gray-700 border-transparent';
      case 'ghost-producer':
        return 'bg-transparent hover:bg-green-100 text-green-600 border-transparent';
      case 'ghost-buyer':
        return 'bg-transparent hover:bg-blue-100 text-blue-600 border-transparent';
      case 'ghost-auditor':
        return 'bg-transparent hover:bg-purple-100 text-purple-600 border-transparent';
      case 'success':
        return 'bg-green-600 hover:bg-green-700 text-white border-green-600';
      case 'warning':
        return 'bg-yellow-600 hover:bg-yellow-700 text-white border-yellow-600';
      case 'error':
        return 'bg-red-600 hover:bg-red-700 text-white border-red-600';
      case 'gradient':
        return 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-transparent';
      case 'gradient-producer':
        return 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white border-transparent';
      case 'gradient-premium':
        return 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-transparent';
      default:
        return 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'xs':
        return 'px-2 py-1 text-xs';
      case 'sm':
        return 'px-3 py-2 text-sm';
      case 'md':
        return 'px-4 py-3 text-sm';
      case 'lg':
        return 'px-6 py-3 text-base';
      case 'xl':
        return 'px-8 py-4 text-lg';
      default:
        return 'px-4 py-3 text-sm';
    }
  };

  const getGlowClasses = () => {
    if (!glowing) return '';
    
    switch (variant) {
      case 'producer':
      case 'gradient-producer':
        return 'shadow-lg shadow-green-500/25 hover:shadow-green-500/40';
      case 'buyer':
        return 'shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40';
      case 'auditor':
        return 'shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40';
      case 'gradient-premium':
        return 'shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40';
      default:
        return 'shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40';
    }
  };

  const getLoadingVariant = () => {
    if (variant.includes('producer')) return 'producer';
    if (variant.includes('buyer')) return 'buyer';
    if (variant.includes('auditor')) return 'auditor';
    if (variant.includes('outline') || variant.includes('ghost')) return 'default';
    return 'white';
  };

  const baseClasses = `
    relative
    inline-flex
    items-center
    justify-center
    gap-2
    font-medium
    border
    rounded-lg
    transition-all
    duration-200
    focus:outline-none
    focus:ring-2
    focus:ring-blue-500
    focus:ring-offset-2
    disabled:opacity-50
    disabled:cursor-not-allowed
    disabled:hover:transform-none
    ${fullWidth ? 'w-full' : ''}
    ${getSizeClasses()}
    ${getVariantClasses()}
    ${getGlowClasses()}
    ${className}
  `;

  const buttonVariants = {
    initial: { 
      scale: 1 
    },
    hover: {
      scale: 1.05,
      transition: {
        duration: 0.2,
        type: "spring",
        stiffness: 400
      }
    },
    tap: {
      scale: 0.95,
      transition: {
        duration: 0.1
      }
    }
  };

  const iconVariants = {
    initial: { 
      x: 0 
    },
    hover: {
      x: iconPosition === 'right' ? 3 : -3,
      transition: {
        duration: 0.2
      }
    }
  };

  const handleClick = (e) => {
    if (loading || disabled) return;
    onClick?.(e);
  };

  return (
    <motion.button
      variants={buttonVariants}
      initial="initial"
      whileHover={!disabled && !loading ? "hover" : {}}
      whileTap={!disabled && !loading ? "tap" : {}}
      className={baseClasses}
      onClick={handleClick}
      disabled={disabled || loading}
      {...props}
    >
      {/* Loading Spinner */}
      {loading && (
        <InlineLoader 
          size="sm" 
          variant={getLoadingVariant()} 
          className="absolute" 
        />
      )}

      {/* Content Wrapper */}
      <div className={`flex items-center gap-2 ${loading ? 'opacity-0' : 'opacity-100'} transition-opacity`}>
        {/* Left Icon */}
        {Icon && iconPosition === 'left' && (
          <motion.div variants={iconVariants}>
            <Icon className="w-4 h-4" />
          </motion.div>
        )}

        {/* Button Text */}
        <span>{children}</span>

        {/* Right Icon */}
        {Icon && iconPosition === 'right' && (
          <motion.div variants={iconVariants}>
            <Icon className="w-4 h-4" />
          </motion.div>
        )}
      </div>
    </motion.button>
  );
};

// Floating Action Button variant
export const FloatingActionButton = ({ 
  icon: Icon, 
  className = '', 
  size = 'md',
  variant = 'primary',
  ...props 
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-10 h-10';
      case 'md':
        return 'w-12 h-12';
      case 'lg':
        return 'w-16 h-16';
      default:
        return 'w-12 h-12';
    }
  };

  return (
    <AnimatedButton
      variant={variant}
      className={`
        ${getSizeClasses()}
        !p-0
        rounded-full
        shadow-lg
        fixed
        bottom-6
        right-6
        z-40
        ${className}
      `}
      glowing={true}
      {...props}
    >
      {Icon && <Icon className={size === 'lg' ? 'w-8 h-8' : size === 'sm' ? 'w-4 h-4' : 'w-6 h-6'} />}
    </AnimatedButton>
  );
};

export default AnimatedButton;
