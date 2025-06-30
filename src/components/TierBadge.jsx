import React from 'react';

const TierBadge = ({ tier, size = 'medium', showLabel = false, className = '' }) => {
  // Tier color mappings based on performance levels
  const tierColors = {
    'S': { bg: '#FF6B6B', text: '#FFFFFF' }, // Red/Pink for S-tier
    'A': { bg: '#4ECDC4', text: '#FFFFFF' }, // Teal for A-tier
    'B': { bg: '#45B7D1', text: '#FFFFFF' }, // Blue for B-tier
    'C': { bg: '#96CEB4', text: '#2C3E50' }, // Light green for C-tier
    'D': { bg: '#FECA57', text: '#2C3E50' }, // Yellow for D-tier
    'F': { bg: '#95A5A6', text: '#FFFFFF' }  // Gray for F-tier
  };

  // Size mappings
  const sizeClasses = {
    small: 'tier-badge-small',
    medium: 'tier-badge-medium',
    large: 'tier-badge-large'
  };

  const tierData = tierColors[tier?.toUpperCase()] || tierColors['F'];
  const sizeClass = sizeClasses[size] || sizeClasses.medium;

  // Tier descriptions for tooltips
  const tierDescriptions = {
    'S': 'Elite tier - Top performance',
    'A': 'Excellent tier - High performance', 
    'B': 'Good tier - Above average performance',
    'C': 'Average tier - Decent performance',
    'D': 'Below average tier - Limited use',
    'F': 'Poor tier - Not recommended'
  };

  const tierDisplay = tier?.toUpperCase() || 'F';
  const description = tierDescriptions[tierDisplay] || 'Unknown tier';

  return (
    <span 
      className={`tier-badge ${sizeClass} ${className}`}
      style={{ 
        backgroundColor: tierData.bg,
        color: tierData.text,
        border: `2px solid ${tierData.bg}`,
        borderRadius: '4px',
        padding: size === 'small' ? '2px 4px' : size === 'large' ? '6px 10px' : '4px 6px',
        fontSize: size === 'small' ? '10px' : size === 'large' ? '16px' : '12px',
        fontWeight: 'bold',
        display: 'inline-block',
        minWidth: size === 'small' ? '16px' : size === 'large' ? '24px' : '20px',
        textAlign: 'center'
      }}
      title={`${tierDisplay} Tier - ${description}`}
    >
      {tierDisplay}
      {showLabel && <span className="tier-label"> Tier</span>}
    </span>
  );
};

export default TierBadge; 