import React from 'react';

const TypeIcon = ({ type, size = 'medium', className = '' }) => {
  // Type color mappings based on official Pokemon colors
  const typeColors = {
    normal: '#A8A878',
    fire: '#F08030',
    water: '#6890F0',
    electric: '#F8D030',
    grass: '#78C850',
    ice: '#98D8D8',
    fighting: '#C03028',
    poison: '#A040A0',
    ground: '#E0C068',
    flying: '#A890F0',
    psychic: '#F85888',
    bug: '#A8B820',
    rock: '#B8A038',
    ghost: '#705898',
    dragon: '#7038F8',
    dark: '#705848',
    steel: '#B8B8D0',
    fairy: '#EE99AC'
  };

  // Size mappings
  const sizeClasses = {
    small: 'type-icon-small',
    medium: 'type-icon-medium',
    large: 'type-icon-large'
  };

  const typeColor = typeColors[type?.toLowerCase()] || '#68A090';
  const sizeClass = sizeClasses[size] || sizeClasses.medium;

  return (
    <span 
      className={`type-icon ${sizeClass} ${className}`}
      style={{ backgroundColor: typeColor }}
      title={type ? type.charAt(0).toUpperCase() + type.slice(1) : 'Unknown'}
    >
      {type ? type.charAt(0).toUpperCase() + type.slice(1) : '?'}
    </span>
  );
};

export default TypeIcon; 