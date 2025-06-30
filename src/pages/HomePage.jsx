import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import SearchBar from '../components/SearchBar';
import PokemonCard from '../components/PokemonCard';
import LoadingSpinner from '../components/LoadingSpinner';

const HomePage = () => {
  const { 
    data, 
    loading, 
    error,
    retryCount,
    dataStatus,
    retry,
    clearCache,
    searchPokemon,
    getAllPokemon,
    getDataSummary,
    calculatePVPPerformance 
  } = useData();
  
  const [searchResults, setSearchResults] = useState([]);
  const [selectedPokemon, setSelectedPokemon] = useState(null);

  // Show loading spinner when loading or when there's an error
  if (loading || error) {
    return (
      <LoadingSpinner 
        loading={loading}
        error={error}
        retryCount={retryCount}
        onRetry={retry}
        onClearCache={clearCache}
        dataStatus={dataStatus}
      />
    );
  }

  // If we have no data after loading (shouldn't happen with new system, but just in case)
  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md mx-4">
          <div className="text-center">
            <div className="text-gray-500 text-6xl mb-4">📊</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">No Data Available</h2>
            <p className="text-gray-600 mb-6">
              No Pokemon data is currently available. This shouldn't happen with the new system.
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>
    );
  }

  const summary = getDataSummary() || {};
  const allPokemon = getAllPokemon() || [];
  const topPvpPokemon = allPokemon.slice(0, 6); // Show first 6 from rankings

  const handleSearch = (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    
    const results = searchPokemon(query) || [];
    setSearchResults(results.slice(0, 10)); // Limit to 10 results
  };

  const handlePokemonSelect = (pokemon) => {
    const performance = calculatePVPPerformance(pokemon);
    setSelectedPokemon({
      ...pokemon,
      performance
    });
    setSearchResults([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900">
      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-8 pb-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            Pokemon GO Investment Guide
          </h1>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Discover which Pokemon are worth powering up using real data from PVPoke and DialgaDex. 
            Make informed decisions about your stardust and candy investments.
          </p>
          
          {/* Data Status Indicator */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 max-w-2xl mx-auto mb-6">
            <div className="text-white font-semibold mb-2">Real Data Sources:</div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {Object.entries(dataStatus || {}).map(([source, status]) => (
                <div key={source} className="flex items-center justify-between">
                  <span className="text-white/80 capitalize">
                    {source.replace(/([A-Z])/g, ' $1').trim()}:
                  </span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    status === 'success' ? 'bg-green-500/20 text-green-300' :
                    'bg-red-500/20 text-red-300'
                  }`}>
                    {status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Search Section */}
        <div className="max-w-2xl mx-auto mb-12">
          <SearchBar 
            onSearch={handleSearch}
            placeholder="Search for any Pokemon..."
            results={searchResults}
            onSelect={handlePokemonSelect}
          />
        </div>

        {/* Selected Pokemon Details */}
        {selectedPokemon && (
          <div className="max-w-4xl mx-auto mb-12">
            <div className="bg-white rounded-lg shadow-xl p-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                {selectedPokemon.speciesName || selectedPokemon.name} Analysis
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-700 mb-3">PVP Performance</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Overall Score:</span>
                      <span className="font-bold">{selectedPokemon.performance?.overall || 0}/100</span>
                    </div>
                    {selectedPokemon.performance?.leagues && Object.entries(selectedPokemon.performance.leagues).map(([league, data]) => (
                      <div key={league} className="flex justify-between text-sm">
                        <span className="capitalize">{league} League:</span>
                        <span>#{data.rank || 'N/A'} ({data.score}/100)</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-700 mb-3">Pokemon Info</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Types:</strong> {selectedPokemon.types?.join(', ') || 'Unknown'}</div>
                    <div><strong>Species ID:</strong> {selectedPokemon.speciesId}</div>
                    {selectedPokemon.rating && <div><strong>Rating:</strong> {selectedPokemon.rating}</div>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Stats */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 text-center">
              <div className="text-3xl font-bold text-white mb-2">{summary.totalPokemon}</div>
              <div className="text-blue-100">Total Pokemon</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 text-center">
              <div className="text-3xl font-bold text-white mb-2">{summary.availableLeagues?.length || 0}</div>
              <div className="text-blue-100">Available Leagues</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 text-center">
              <div className="text-3xl font-bold text-white mb-2">{summary.totalRaids}</div>
              <div className="text-blue-100">Raid Bosses</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 text-center">
              <div className="text-3xl font-bold text-white mb-2">
                {summary.lastUpdated ? new Date(summary.lastUpdated).toLocaleDateString() : 'N/A'}
              </div>
              <div className="text-blue-100">Last Updated</div>
            </div>
          </div>
        )}

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white rounded-lg shadow-xl p-6">
            <div className="text-4xl mb-4">⚔️</div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">PVP Rankings</h3>
            <p className="text-gray-600 mb-4">
              Real PVP rankings from PVPoke for Great League, Ultra League, and Master League 
              based on comprehensive battle simulations.
            </p>
            <div className="text-sm text-gray-500">
              Live data from PVPoke.com
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-xl p-6">
            <div className="text-4xl mb-4">🏆</div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">Raid Data</h3>
            <p className="text-gray-600 mb-4">
              Current raid bosses and their CP ranges sourced directly from DialgaDex 
              for the most accurate raid information.
            </p>
            <div className="text-sm text-gray-500">
              Live data from DialgaDex.com
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-xl p-6">
            <div className="text-4xl mb-4">💎</div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">Investment Guide</h3>
            <p className="text-gray-600 mb-4">
              Smart recommendations based on real performance data to help you decide 
              which Pokemon deserve your precious stardust and rare candies.
            </p>
            <div className="text-sm text-gray-500">
              Calculated from authentic source data
            </div>
          </div>
        </div>

        {/* Top Pokemon Section */}
        {topPvpPokemon.length > 0 && (
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">
              Top Performing Pokemon
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {topPvpPokemon.map((pokemon, index) => (
                <div
                  key={pokemon.speciesId || index}
                  className="bg-white rounded-lg shadow-lg p-6 cursor-pointer hover:shadow-xl transition-shadow"
                  onClick={() => handlePokemonSelect(pokemon)}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-800">
                      {pokemon.speciesName || pokemon.name}
                    </h3>
                    <span className="text-2xl font-bold text-blue-600">
                      #{pokemon.rank}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    <strong>Rating:</strong> {pokemon.rating || 'N/A'}
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    <strong>Types:</strong> {pokemon.types?.join(', ') || 'Unknown'}
                  </div>
                  <div className="text-sm text-gray-600">
                    <strong>Score:</strong> {pokemon.score || 'N/A'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Data Authenticity Notice */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center">
          <h3 className="text-white font-bold mb-3">🔒 Authentic Data Only</h3>
          <p className="text-white/80 text-sm">
            This application only displays real data scraped directly from PVPoke.com and DialgaDex.com. 
            No artificial or simulated data is used. If external sources are unavailable, 
            the app will notify you rather than showing placeholder information.
          </p>
        </div>
      </div>
    </div>
  );
};

// Helper function to get tier colors
const getTierColor = (tier) => {
  switch (tier) {
    case 'S+':
      return 'bg-purple-100 text-purple-800';
    case 'S':
      return 'bg-red-100 text-red-800';
    case 'A':
      return 'bg-orange-100 text-orange-800';
    case 'B':
      return 'bg-yellow-100 text-yellow-800';
    case 'C':
      return 'bg-green-100 text-green-800';
    case 'D':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default HomePage; 