import React, { useState } from 'react';

const Tooltip = ({ 
  children, 
  content, 
  position = 'top', 
  delay = 300,
  className = '',
  disabled = false 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showTimeout, setShowTimeout] = useState(null);
  const [hideTimeout, setHideTimeout] = useState(null);

  const showTooltip = () => {
    if (disabled || !content) return;
    
    if (hideTimeout) {
      clearTimeout(hideTimeout);
      setHideTimeout(null);
    }
    
    const timeout = setTimeout(() => {
      setIsVisible(true);
    }, delay);
    
    setShowTimeout(timeout);
  };

  const hideTooltip = () => {
    if (showTimeout) {
      clearTimeout(showTimeout);
      setShowTimeout(null);
    }
    
    const timeout = setTimeout(() => {
      setIsVisible(false);
    }, 100);
    
    setHideTimeout(timeout);
  };

  // Position classes
  const positionClasses = {
    top: 'tooltip-top',
    bottom: 'tooltip-bottom',
    left: 'tooltip-left',
    right: 'tooltip-right'
  };

  const positionClass = positionClasses[position] || positionClasses.top;

  if (disabled || !content) {
    return children;
  }

  return (
    <div 
      className={`tooltip-container ${className}`}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      style={{ position: 'relative', display: 'inline-block' }}
    >
      {children}
      {isVisible && (
        <div 
          className={`tooltip ${positionClass}`}
          style={{
            position: 'absolute',
            zIndex: 1000,
            backgroundColor: '#2C3E50',
            color: '#FFFFFF',
            padding: '8px 12px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 'normal',
            lineHeight: '1.4',
            whiteSpace: 'pre-line',
            boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
            border: '1px solid #34495E',
            maxWidth: '250px',
            wordWrap: 'break-word',
            // Position-specific styles
            ...(position === 'top' && {
              bottom: '100%',
              left: '50%',
              transform: 'translateX(-50%)',
              marginBottom: '8px'
            }),
            ...(position === 'bottom' && {
              top: '100%',
              left: '50%',
              transform: 'translateX(-50%)',
              marginTop: '8px'
            }),
            ...(position === 'left' && {
              right: '100%',
              top: '50%',
              transform: 'translateY(-50%)',
              marginRight: '8px'
            }),
            ...(position === 'right' && {
              left: '100%',
              top: '50%',
              transform: 'translateY(-50%)',
              marginLeft: '8px'
            })
          }}
        >
          {content}
          {/* Tooltip arrow */}
          <div 
            className="tooltip-arrow"
            style={{
              position: 'absolute',
              width: 0,
              height: 0,
              ...(position === 'top' && {
                top: '100%',
                left: '50%',
                transform: 'translateX(-50%)',
                borderLeft: '6px solid transparent',
                borderRight: '6px solid transparent',
                borderTop: '6px solid #2C3E50'
              }),
              ...(position === 'bottom' && {
                bottom: '100%',
                left: '50%',
                transform: 'translateX(-50%)',
                borderLeft: '6px solid transparent',
                borderRight: '6px solid transparent',
                borderBottom: '6px solid #2C3E50'
              }),
              ...(position === 'left' && {
                left: '100%',
                top: '50%',
                transform: 'translateY(-50%)',
                borderTop: '6px solid transparent',
                borderBottom: '6px solid transparent',
                borderLeft: '6px solid #2C3E50'
              }),
              ...(position === 'right' && {
                right: '100%',
                top: '50%',
                transform: 'translateY(-50%)',
                borderTop: '6px solid transparent',
                borderBottom: '6px solid transparent',
                borderRight: '6px solid #2C3E50'
              })
            }}
          />
        </div>
      )}
    </div>
  );
};

export default Tooltip; 