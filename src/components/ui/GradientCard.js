import React from 'react';
import { motion } from 'framer-motion';

const GradientCard = ({ 
  children, 
  className = '', 
  variant = 'default',
  blur = true,
  hover = true,
  gradient,
  onClick,
  ...props 
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'producer':
        return 'bg-gradient-to-br from-green-400/20 via-emerald-500/20 to-teal-600/20 border-green-200/50';
      case 'buyer':
        return 'bg-gradient-to-br from-blue-400/20 via-cyan-500/20 to-sky-600/20 border-blue-200/50';
      case 'auditor':
        return 'bg-gradient-to-br from-purple-400/20 via-violet-500/20 to-indigo-600/20 border-purple-200/50';
      case 'success':
        return 'bg-gradient-to-br from-green-400/20 via-emerald-500/20 to-green-600/20 border-green-200/50';
      case 'warning':
        return 'bg-gradient-to-br from-yellow-400/20 via-amber-500/20 to-orange-600/20 border-yellow-200/50';
      case 'error':
        return 'bg-gradient-to-br from-red-400/20 via-rose-500/20 to-red-600/20 border-red-200/50';
      case 'premium':
        return 'bg-gradient-to-br from-purple-400/20 via-pink-500/20 to-rose-600/20 border-purple-200/50';
      case 'neutral':
        return 'bg-gradient-to-br from-gray-100/60 via-gray-200/60 to-gray-300/60 border-gray-200/50';
      default:
        return 'bg-white/60 border-white/70';
    }
  };

  const customGradient = gradient ? { background: gradient } : {};

  const baseClasses = `
    ${blur ? 'backdrop-blur-sm' : ''}
    rounded-2xl 
    shadow-sm 
    border 
    transition-all 
    duration-300
    ${hover ? 'hover:shadow-lg hover:scale-[1.02] hover:-translate-y-1' : ''}
    ${onClick ? 'cursor-pointer' : ''}
    ${getVariantClasses()}
    ${className}
  `;

  const cardVariants = {
    initial: { 
      opacity: 0, 
      y: 20,
      scale: 0.95
    },
    animate: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        type: "spring",
        stiffness: 100
      }
    },
    hover: hover ? {
      scale: 1.02,
      y: -4,
      transition: {
        duration: 0.2,
        type: "spring",
        stiffness: 400
      }
    } : {},
    tap: onClick ? {
      scale: 0.98,
      transition: {
        duration: 0.1
      }
    } : {}
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="initial"
      animate="animate"
      whileHover="hover"
      whileTap="tap"
      className={baseClasses}
      style={customGradient}
      onClick={onClick}
      {...props}
    >
      {children}
    </motion.div>
  );
};

// Specialized card variants for convenience
export const ProducerCard = ({ children, ...props }) => (
  <GradientCard variant="producer" {...props}>
    {children}
  </GradientCard>
);

export const BuyerCard = ({ children, ...props }) => (
  <GradientCard variant="buyer" {...props}>
    {children}
  </GradientCard>
);

export const AuditorCard = ({ children, ...props }) => (
  <GradientCard variant="auditor" {...props}>
    {children}
  </GradientCard>
);

export const SuccessCard = ({ children, ...props }) => (
  <GradientCard variant="success" {...props}>
    {children}
  </GradientCard>
);

export const WarningCard = ({ children, ...props }) => (
  <GradientCard variant="warning" {...props}>
    {children}
  </GradientCard>
);

export const ErrorCard = ({ children, ...props }) => (
  <GradientCard variant="error" {...props}>
    {children}
  </GradientCard>
);

export const PremiumCard = ({ children, ...props }) => (
  <GradientCard variant="premium" {...props}>
    {children}
  </GradientCard>
);

export default GradientCard;
