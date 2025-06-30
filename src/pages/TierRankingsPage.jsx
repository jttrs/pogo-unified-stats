import React, { useState, useEffect } from 'react';
import { ChevronDown, Download, Trophy, Target, Zap, Filter } from 'lucide-react';
import { useData } from '../context/DataContext';
import TierRankingService from '../services/tierRankingService';
import PokemonCard from '../components/PokemonCard';

const TierRankingsPage = () => {
  const { data, loading, error } = useData();
  const [tierService] = useState(() => new TierRankingService());
  const [rankings, setRankings] = useState(null);
  const [selectedView, setSelectedView] = useState('overall');
  const [selectedType, setSelectedType] = useState('fire');
  const [displayMode, setDisplayMode] = useState('tier'); // 'tier' or 'list'
  const [calculating, setCalculating] = useState(false);

  const pokemonTypes = [
    'normal', 'fire', 'water', 'grass', 'electric', 'ice',
    'fighting', 'poison', 'ground', 'flying', 'psychic', 
    'bug', 'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'
  ];

  const views = [
    { value: 'overall', label: 'Overall Rankings', icon: Trophy },
    { value: 'type', label: 'Type-Specific', icon: Zap },
    { value: 'counter', label: 'Counter Rankings', icon: Target }
  ];

  useEffect(() => {
    if (data && !loading && !calculating) {
      calculateRankings();
    }
  }, [data, loading]);

  const calculateRankings = async () => {
    if (!data || calculating) return;
    
    setCalculating(true);
    console.log('🔮 Calculating DialgaDex-inspired tier rankings...');
    
    try {
      // Extract Pokemon data from our sources
      const allPokemon = extractPokemonFromData(data);
      
      if (allPokemon.length === 0) {
        console.warn('No Pokemon data available for ranking');
        setCalculating(false);
        return;
      }

      console.log(`📊 Processing ${allPokemon.length} Pokemon for comprehensive rankings...`);

      // Generate comprehensive rankings
      const comprehensiveRankings = tierService.generateComprehensiveRankings(allPokemon);
      const counterRankings = tierService.generateCounterRankings(allPokemon);

      setRankings({
        ...comprehensiveRankings,
        counters: counterRankings
      });

      console.log('✅ Tier rankings calculated successfully!');
      console.log('Rankings preview:', {
        overall: comprehensiveRankings.overall.length,
        byType: Object.keys(comprehensiveRankings.byType).length,
        counters: Object.keys(counterRankings).length
      });

    } catch (error) {
      console.error('❌ Error calculating rankings:', error);
    } finally {
      setCalculating(false);
    }
  };

  const extractPokemonFromData = (data) => {
    const pokemonMap = new Map();

    // Extract from PVP rankings
    if (data.pvpRankings) {
      Object.entries(data.pvpRankings).forEach(([league, rankings]) => {
        if (Array.isArray(rankings)) {
          rankings.forEach(pokemon => {
            if (!pokemon) return;
            
            const id = pokemon.speciesId || pokemon.Pokemon || pokemon.name;
            if (!id) return;

            if (!pokemonMap.has(id)) {
              pokemonMap.set(id, {
                id: id,
                name: pokemon.Pokemon || pokemon.name || id,
                types: [pokemon['Type 1'], pokemon['Type 2']].filter(Boolean).map(t => t.toLowerCase()),
                stats: {
                  attack: parseInt(pokemon.Attack || 100),
                  defense: parseInt(pokemon.Defense || 100),
                  stamina: parseInt(pokemon.Stamina || 100)
                },
                pvpScores: {},
                moves: [] // Simplified - would need move data
              });
            }

            const existingPokemon = pokemonMap.get(id);
            existingPokemon.pvpScores[league] = parseFloat(pokemon.Score || 0);
          });
        }
      });
    }

    // Extract from raid data
    if (data.raidData?.current) {
      Object.entries(data.raidData.current).forEach(([tier, raids]) => {
        if (Array.isArray(raids)) {
          raids.forEach(raid => {
            const id = raid.id || raid.name;
            if (!id) return;

            if (!pokemonMap.has(id)) {
              pokemonMap.set(id, {
                id: id,
                name: raid.name || id,
                types: Array.isArray(raid.types) ? raid.types.map(t => t.toLowerCase()) : ['normal'],
                stats: {
                  attack: 120, // Estimated for raid bosses
                  defense: 120,
                  stamina: 150
                },
                pvpScores: {},
                moves: [],
                raidTier: parseInt(tier)
              });
            }
          });
        }
      });
    }

    return Array.from(pokemonMap.values());
  };

  const getCurrentRankings = () => {
    if (!rankings) return [];

    switch (selectedView) {
      case 'overall':
        return rankings.overall || [];
      case 'type':
        return rankings.byType?.[selectedType] || [];
      case 'counter':
        return rankings.counters?.[selectedType] || [];
      default:
        return [];
    }
  };

  const exportRankings = () => {
    const currentRankings = getCurrentRankings();
    if (currentRankings.length === 0) return;

    const exportData = tierService.exportRankings(currentRankings, selectedView);
    const csvContent = [
      ['Rank', 'Pokemon', 'Tier', 'Score', 'Types', 'Percentile'].join(','),
      ...exportData.rankings.map(pokemon => [
        pokemon.rank,
        `"${pokemon.name}"`,
        pokemon.tier,
        pokemon.score.toFixed(2),
        `"${pokemon.types.join('/')}"`,
        pokemon.percentile
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pokemon-tier-rankings-${selectedView}-${selectedType}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getTierColor = (tier) => {
    const colors = {
      'S+': 'bg-purple-500 text-white border-purple-600',
      'S': 'bg-red-500 text-white border-red-600',
      'A': 'bg-orange-500 text-white border-orange-600',
      'B': 'bg-yellow-500 text-black border-yellow-600',
      'C': 'bg-green-500 text-white border-green-600',
      'D': 'bg-gray-500 text-white border-gray-600'
    };
    return colors[tier] || colors['D'];
  };

  const groupByTier = (pokemonList) => {
    const tierGroups = {};
    tierService.tiers.forEach(tier => {
      tierGroups[tier] = pokemonList.filter(p => p.tier === tier);
    });
    return tierGroups;
  };

  if (loading || calculating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">
            {calculating ? 'Calculating Tier Rankings...' : 'Loading Data...'}
          </h2>
          <p className="text-gray-500 mt-2">
            {calculating ? 'Using DialgaDex-inspired algorithms' : 'Fetching Pokemon data'}
          </p>
        </div>
      </div>
    );
  }

  if (error || !rankings) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-700">Unable to Calculate Rankings</h2>
          <p className="text-gray-500 mt-2">
            {error || 'No data available for tier calculations'}
          </p>
          <button 
            onClick={calculateRankings}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry Calculation
          </button>
        </div>
      </div>
    );
  }

  const currentRankings = getCurrentRankings();
  const tierGroups = displayMode === 'tier' ? groupByTier(currentRankings) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            🏆 Comprehensive Tier Rankings
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Advanced Pokemon rankings using DialgaDex-inspired algorithms with Jenks Natural Breaks tier determination
          </p>
          <div className="mt-4 text-sm text-gray-500">
            Total Pokemon Analyzed: {rankings.metadata?.totalPokemon || 0} | 
            Algorithm: {rankings.metadata?.algorithm || 'DialgaDex-inspired Jenks Natural Breaks'}
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* View Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ranking Type</label>
              <div className="relative">
                <select
                  value={selectedView}
                  onChange={(e) => setSelectedView(e.target.value)}
                  className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {views.map(view => (
                    <option key={view.value} value={view.value}>
                      {view.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-2 h-5 w-5 text-gray-400" />
              </div>
            </div>

            {/* Type Selection (for type-specific and counter views) */}
            {(selectedView === 'type' || selectedView === 'counter') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {selectedView === 'counter' ? 'Target Type' : 'Attack Type'}
                </label>
                <div className="relative">
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 capitalize"
                  >
                    {pokemonTypes.map(type => (
                      <option key={type} value={type} className="capitalize">
                        {type}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-2 h-5 w-5 text-gray-400" />
                </div>
              </div>
            )}

            {/* Display Mode */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Display Mode</label>
              <div className="flex space-x-2">
                <button
                  onClick={() => setDisplayMode('tier')}
                  className={`px-3 py-2 rounded text-sm font-medium ${
                    displayMode === 'tier' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  <Filter className="w-4 h-4 inline mr-1" />
                  By Tier
                </button>
                <button
                  onClick={() => setDisplayMode('list')}
                  className={`px-3 py-2 rounded text-sm font-medium ${
                    displayMode === 'list' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  List
                </button>
              </div>
            </div>

            {/* Export */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Export</label>
              <button
                onClick={exportRankings}
                className="w-full bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
              >
                <Download className="w-4 h-4 inline mr-2" />
                CSV
              </button>
            </div>
          </div>
        </div>

        {/* Rankings Display */}
        {displayMode === 'tier' ? (
          <div className="space-y-8">
            {tierService.tiers.map(tier => {
              const tierPokemon = tierGroups[tier] || [];
              if (tierPokemon.length === 0) return null;

              return (
                <div key={tier} className="bg-white rounded-lg shadow-lg overflow-hidden">
                  <div className={`px-6 py-4 ${getTierColor(tier)}`}>
                    <h2 className="text-2xl font-bold flex items-center">
                      {tier} Tier ({tierPokemon.length} Pokemon)
                      <span className="ml-auto text-lg font-normal">
                        {tier === 'S+' && 'Exceptional'}
                        {tier === 'S' && 'Outstanding'}  
                        {tier === 'A' && 'Excellent'}
                        {tier === 'B' && 'Good'}
                        {tier === 'C' && 'Average'}
                        {tier === 'D' && 'Below Average'}
                      </span>
                    </h2>
                  </div>
                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {tierPokemon.map((pokemon, index) => (
                      <div key={`${pokemon.id}-${index}`} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold truncate">{pokemon.name}</h3>
                          <span className="text-sm font-bold text-gray-600">
                            #{pokemon.rank}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 mb-2">
                          Score: {(pokemon.typeScore || pokemon.overallScore || pokemon.counterScore || 0).toFixed(1)}
                        </div>
                        <div className="flex flex-wrap gap-1 mb-2">
                          {pokemon.types?.map(type => (
                            <span key={type} className={`px-2 py-1 rounded text-xs capitalize type-${type}`}>
                              {type}
                            </span>
                          ))}
                        </div>
                        <div className="text-xs text-gray-500">
                          {pokemon.percentile}th percentile
                        </div>
                        {pokemon.bestAttackType && (
                          <div className="text-xs text-blue-600 mt-1">
                            Best vs: {pokemon.bestAttackType} (×{pokemon.effectiveness})
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pokemon</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tier</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Types</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Percentile</th>
                    {selectedView === 'counter' && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Best Attack</th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentRankings.slice(0, 100).map((pokemon, index) => (
                    <tr key={`${pokemon.id}-${index}`} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{pokemon.rank}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {pokemon.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTierColor(pokemon.tier)}`}>
                          {pokemon.tier}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {(pokemon.typeScore || pokemon.overallScore || pokemon.counterScore || 0).toFixed(1)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-1">
                          {pokemon.types?.map(type => (
                            <span key={type} className={`px-2 py-1 rounded text-xs capitalize type-${type}`}>
                              {type}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {pokemon.percentile}%
                      </td>
                      {selectedView === 'counter' && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {pokemon.bestAttackType && (
                            <span className="capitalize">
                              {pokemon.bestAttackType} (×{pokemon.effectiveness})
                            </span>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Statistics */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {tierService.tiers.map(tier => {
            const count = currentRankings.filter(p => p.tier === tier).length;
            return (
              <div key={tier} className={`rounded-lg p-4 text-center ${getTierColor(tier)}`}>
                <div className="text-2xl font-bold">{count}</div>
                <div className="text-sm opacity-80">{tier} Tier</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TierRankingsPage; 