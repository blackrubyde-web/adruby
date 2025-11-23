import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Tooltip = ({ 
  children, 
  content, 
  position = 'top',
  delay = 0,
  className = '',
  disabled = false 
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const showTooltip = () => {
    if (!disabled) {
      setIsVisible(true);
    }
  };

  const hideTooltip = () => {
    setIsVisible(false);
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'top':
        return 'bottom-full left-1/2 transform -translate-x-1/2 mb-2';
      case 'bottom':
        return 'top-full left-1/2 transform -translate-x-1/2 mt-2';
      case 'left':
        return 'right-full top-1/2 transform -translate-y-1/2 mr-2';
      case 'right':
        return 'left-full top-1/2 transform -translate-y-1/2 ml-2';
      default:
        return 'bottom-full left-1/2 transform -translate-x-1/2 mb-2';
    }
  };

  const getArrowClasses = () => {
    switch (position) {
      case 'top':
        return 'top-full left-1/2 transform -translate-x-1/2 border-t-gray-900 border-t-8 border-x-transparent border-x-8 border-b-0';
      case 'bottom':
        return 'bottom-full left-1/2 transform -translate-x-1/2 border-b-gray-900 border-b-8 border-x-transparent border-x-8 border-t-0';
      case 'left':
        return 'left-full top-1/2 transform -translate-y-1/2 border-l-gray-900 border-l-8 border-y-transparent border-y-8 border-r-0';
      case 'right':
        return 'right-full top-1/2 transform -translate-y-1/2 border-r-gray-900 border-r-8 border-y-transparent border-y-8 border-l-0';
      default:
        return 'top-full left-1/2 transform -translate-x-1/2 border-t-gray-900 border-t-8 border-x-transparent border-x-8 border-b-0';
    }
  };

  const tooltipVariants = {
    initial: { 
      opacity: 0, 
      scale: 0.8,
      y: position === 'top' ? 10 : position === 'bottom' ? -10 : 0,
      x: position === 'left' ? 10 : position === 'right' ? -10 : 0
    },
    animate: { 
      opacity: 1, 
      scale: 1,
      y: 0,
      x: 0,
      transition: {
        duration: 0.15,
        delay: delay / 1000,
        ease: "easeOut"
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.8,
      y: position === 'top' ? 10 : position === 'bottom' ? -10 : 0,
      x: position === 'left' ? 10 : position === 'right' ? -10 : 0,
      transition: { 
        duration: 0.1,
        ease: "easeIn"
      }
    }
  };

  if (disabled || !content) {
    return children;
  }

  return (
    <div 
      className={`relative inline-block ${className}`}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            className={`absolute z-50 ${getPositionClasses()}`}
            variants={tooltipVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <div className="bg-gray-900 text-white text-sm rounded-lg py-2 px-3 shadow-lg max-w-xs whitespace-normal">
              {content}
            </div>
            <div className={`absolute w-0 h-0 ${getArrowClasses()}`} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Tooltip;