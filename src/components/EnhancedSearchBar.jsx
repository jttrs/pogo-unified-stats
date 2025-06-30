import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Zap, Trophy, ArrowRight } from 'lucide-react';
import { useData } from '../context/DataContext';
import TypeIcon from './TypeIcon';

const EnhancedSearchBar = ({ 
  onSelect, 
  placeholder = "Search Pokemon...", 
  showTypes = true, 
  showStats = true,
  showRankings = true,
  maxResults = 10,
  className = ""
}) => {
  const { allPokemon, data, rankings } = useData();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  
  const searchRef = useRef(null);
  const dropdownRef = useRef(null);

  // Fuzzy search function
  const fuzzyMatch = (pattern, str) => {
    if (!pattern || !str) return false;
    
    pattern = pattern.toLowerCase();
    str = str.toLowerCase();
    
    // Exact match gets highest priority
    if (str.includes(pattern)) return { score: 100, type: 'exact' };
    
    // Character-by-character fuzzy matching
    let patternIdx = 0;
    let score = 0;
    let consecutiveMatches = 0;
    
    for (let i = 0; i < str.length && patternIdx < pattern.length; i++) {
      if (str[i] === pattern[patternIdx]) {
        patternIdx++;
        consecutiveMatches++;
        score += consecutiveMatches * 2; // Bonus for consecutive matches
      } else {
        consecutiveMatches = 0;
      }
    }
    
    if (patternIdx === pattern.length) {
      return { 
        score: score + (pattern.length / str.length) * 20, // Bonus for shorter strings
        type: 'fuzzy' 
      };
    }
    
    return false;
  };

  // Enhanced search function
  const searchPokemon = (query) => {
    if (!query.trim() || !allPokemon?.length) return [];
    
    const searchResults = [];
    
    allPokemon.forEach(pokemon => {
      const searchableFields = [
        pokemon.speciesName,
        pokemon.speciesId,
        pokemon.name,
        ...(pokemon.types || [])
      ].filter(Boolean);
      
      let bestMatch = null;
      
      searchableFields.forEach(field => {
        const match = fuzzyMatch(query, field);
        if (match && (!bestMatch || match.score > bestMatch.score)) {
          bestMatch = match;
        }
      });
      
      if (bestMatch) {
        // Get ranking data
        let bestRanking = null;
        if (data?.pvp) {
          Object.entries(data.pvp).forEach(([league, rankings]) => {
            const found = rankings.find(r => 
              r.speciesId === pokemon.speciesId || 
              r.Pokemon?.toLowerCase() === pokemon.speciesName?.toLowerCase()
            );
            if (found && (!bestRanking || found.rank < bestRanking.rank)) {
              bestRanking = { ...found, league };
            }
          });
        }
        
        searchResults.push({
          ...pokemon,
          matchScore: bestMatch.score,
          matchType: bestMatch.type,
          ranking: bestRanking
        });
      }
    });
    
    // Sort by match score, then by ranking
    return searchResults
      .sort((a, b) => {
        // Prioritize exact matches
        if (a.matchType === 'exact' && b.matchType !== 'exact') return -1;
        if (b.matchType === 'exact' && a.matchType !== 'exact') return 1;
        
        // Then by match score
        if (a.matchScore !== b.matchScore) return b.matchScore - a.matchScore;
        
        // Then by ranking (lower rank = better)
        const aRank = a.ranking?.rank || 9999;
        const bRank = b.ranking?.rank || 9999;
        return aRank - bRank;
      })
      .slice(0, maxResults);
  };

  // Handle search input
  useEffect(() => {
    if (query.length > 0) {
      setIsLoading(true);
      // Debounce search
      const timer = setTimeout(() => {
        const searchResults = searchPokemon(query);
        setResults(searchResults);
        setShowDropdown(true);
        setSelectedIndex(-1);
        setIsLoading(false);
      }, 150); // 150ms debounce
      
      return () => clearTimeout(timer);
    } else {
      setResults([]);
      setShowDropdown(false);
      setSelectedIndex(-1);
      setIsLoading(false);
    }
  }, [query, allPokemon, data]);

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!showDropdown || results.length === 0) return;
    
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
        if (selectedIndex >= 0 && results[selectedIndex]) {
          handleSelect(results[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowDropdown(false);
        setSelectedIndex(-1);
        searchRef.current?.blur();
        break;
    }
  };

  // Handle Pokemon selection
  const handleSelect = (pokemon) => {
    setQuery('');
    setShowDropdown(false);
    setSelectedIndex(-1);
    onSelect?.(pokemon);
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Format stat display
  const formatStats = (pokemon) => {
    const stats = pokemon.baseStats;
    if (!stats) return null;
    
    return `${stats.atk}/${stats.def}/${stats.hp}`;
  };

  // Get league display
  const getLeagueDisplay = (league) => {
    const leagueNames = {
      cp1500: 'GL',
      cp2500: 'UL', 
      cp10000: 'ML'
    };
    return leagueNames[league] || league?.toUpperCase();
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        
        <input
          ref={searchRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query && setShowDropdown(true)}
          placeholder={placeholder}
          className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg 
                     focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                     placeholder-gray-400 text-sm transition-colors"
        />
        
        {/* Clear button */}
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setShowDropdown(false);
              searchRef.current?.focus();
            }}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        )}
        
        {/* Loading indicator */}
        {isLoading && (
          <div className="absolute inset-y-0 right-8 flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
          </div>
        )}
      </div>

      {/* Dropdown Results */}
      {showDropdown && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto">
          {results.length === 0 && !isLoading ? (
            <div className="px-4 py-3 text-sm text-gray-500 text-center">
              No Pokemon found for "{query}"
            </div>
          ) : (
            <div className="py-1">
              {results.map((pokemon, index) => (
                <div
                  key={`${pokemon.speciesId}-${index}`}
                  className={`px-4 py-3 cursor-pointer transition-colors ${
                    index === selectedIndex 
                      ? 'bg-blue-50 border-l-4 border-blue-500' 
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => handleSelect(pokemon)}
                >
                  <div className="flex items-center justify-between">
                    {/* Pokemon Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {pokemon.speciesName || pokemon.name}
                        </h4>
                        
                        {/* Match type indicator */}
                        {pokemon.matchType === 'exact' && (
                          <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                            Exact
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-3 mt-1">
                        {/* Types */}
                        {showTypes && pokemon.types && (
                          <div className="flex space-x-1">
                            {pokemon.types.slice(0, 2).map(type => (
                              <TypeIcon key={type} type={type} size="sm" />
                            ))}
                          </div>
                        )}
                        
                        {/* Stats */}
                        {showStats && (
                          <span className="text-xs text-gray-500">
                            {formatStats(pokemon)}
                          </span>
                        )}
                        
                        {/* Dex Number */}
                        <span className="text-xs text-gray-400">
                          #{pokemon.dex || '???'}
                        </span>
                      </div>
                    </div>
                    
                    {/* Ranking Info */}
                    {showRankings && pokemon.ranking && (
                      <div className="flex items-center space-x-2 text-xs">
                        <div className="text-right">
                          <div className="font-medium text-gray-900">
                            #{pokemon.ranking.rank}
                          </div>
                          <div className="text-gray-500">
                            {getLeagueDisplay(pokemon.ranking.league)}
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-400" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EnhancedSearchBar; 