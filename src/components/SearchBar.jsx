import React, { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';

const SearchBar = ({ onSearch, placeholder = "Search Pokemon...", results = [], onSelect }) => {
  const [query, setQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef(null);
  const resultsRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (resultsRef.current && !resultsRef.current.contains(event.target) &&
          inputRef.current && !inputRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    setSelectedIndex(-1);
    
    if (value.trim().length >= 2) {
      onSearch(value);
      setShowResults(true);
    } else {
      setShowResults(false);
    }
  };

  const handleKeyDown = (e) => {
    if (!showResults || results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < results.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : results.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < results.length) {
          handleSelectPokemon(results[selectedIndex]);
        } else if (results.length > 0) {
          handleSelectPokemon(results[0]);
        }
        break;
      case 'Escape':
        setShowResults(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const handleSelectPokemon = (pokemon) => {
    setQuery(pokemon.name);
    setShowResults(false);
    setSelectedIndex(-1);
    
    if (onSelect) {
      onSelect(pokemon);
    }
  };

  const handleClear = () => {
    setQuery('');
    setShowResults(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
    onSearch('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query);
      if (results.length > 0) {
        handleSelectPokemon(results[0]);
      }
    }
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (query.trim().length >= 2 && results.length > 0) {
                setShowResults(true);
              }
            }}
            placeholder={placeholder}
            className="w-full pl-12 pr-12 py-4 text-lg border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors bg-white shadow-lg"
            autoComplete="off"
          />
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </form>

      {/* Search Results Dropdown */}
      {showResults && results.length > 0 && (
        <div 
          ref={resultsRef}
          className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-xl max-h-96 overflow-y-auto"
        >
          <div className="py-2">
            {results.map((pokemon, index) => (
              <div
                key={pokemon.id || index}
                className={`px-4 py-3 cursor-pointer transition-colors ${
                  index === selectedIndex 
                    ? 'bg-blue-50 border-l-4 border-blue-500' 
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => handleSelectPokemon(pokemon)}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-semibold text-gray-800">
                      {pokemon.name}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {pokemon.types && pokemon.types.length > 0 && (
                        <span className="flex items-center gap-2">
                          <span>Types:</span>
                          {pokemon.types.map((type, typeIndex) => (
                            <span
                              key={typeIndex}
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(type)}`}
                            >
                              {type}
                            </span>
                          ))}
                        </span>
                      )}
                    </div>
                    {pokemon.stats && (
                      <div className="text-xs text-gray-500 mt-1">
                        ATK: {pokemon.stats.attack} | DEF: {pokemon.stats.defense} | STA: {pokemon.stats.stamina}
                      </div>
                    )}
                  </div>
                  <div className="ml-4 text-right">
                    <div className="text-xs text-gray-400">
                      #{pokemon.id}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {results.length > 0 && (
            <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-500">
              <div className="flex justify-between items-center">
                <span>Use ↑↓ to navigate, Enter to select</span>
                <span>{results.length} result{results.length !== 1 ? 's' : ''}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* No Results Message */}
      {showResults && query.trim().length >= 2 && results.length === 0 && (
        <div 
          ref={resultsRef}
          className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-xl"
        >
          <div className="px-4 py-6 text-center">
            <div className="text-gray-400 text-4xl mb-2">🔍</div>
            <div className="text-gray-600 font-medium">No Pokemon found</div>
            <div className="text-gray-500 text-sm mt-1">
              Try searching for a different Pokemon name
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper function to get type colors
const getTypeColor = (type) => {
  const typeColors = {
    'Normal': 'bg-gray-200 text-gray-800',
    'Fire': 'bg-red-200 text-red-800',
    'Water': 'bg-blue-200 text-blue-800',
    'Electric': 'bg-yellow-200 text-yellow-800',
    'Grass': 'bg-green-200 text-green-800',
    'Ice': 'bg-cyan-200 text-cyan-800',
    'Fighting': 'bg-orange-200 text-orange-800',
    'Poison': 'bg-purple-200 text-purple-800',
    'Ground': 'bg-amber-200 text-amber-800',
    'Flying': 'bg-indigo-200 text-indigo-800',
    'Psychic': 'bg-pink-200 text-pink-800',
    'Bug': 'bg-lime-200 text-lime-800',
    'Rock': 'bg-stone-200 text-stone-800',
    'Ghost': 'bg-violet-200 text-violet-800',
    'Dragon': 'bg-indigo-300 text-indigo-900',
    'Dark': 'bg-gray-300 text-gray-900',
    'Steel': 'bg-slate-200 text-slate-800',
    'Fairy': 'bg-rose-200 text-rose-800'
  };

  return typeColors[type] || 'bg-gray-200 text-gray-800';
};

export default SearchBar; 