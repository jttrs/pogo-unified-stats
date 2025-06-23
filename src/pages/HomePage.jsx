import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import SearchBar from '../components/SearchBar';
import PokemonCard from '../components/PokemonCard';
import LoadingSpinner from '../components/LoadingSpinner';

const HomePage = () => {
  const { 
    data, 
    loading, 
    progress, 
    stage, 
    status, 
    error, 
    getTopPokemon, 
    getStats,
    searchPokemon,
    getPokemonRecommendation 
  } = useData();
  
  const [searchResults, setSearchResults] = useState([]);
  const [selectedPokemon, setSelectedPokemon] = useState(null);

  if (loading) {
    return (
      <LoadingSpinner 
        progress={progress}
        stage={stage}
        status={status}
      />
    );
  }

  if (error && !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md mx-4">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Data Unavailable</h2>
            <p className="text-gray-600 mb-6">
              Unable to load Pokemon data from PVPoke. The external API may be unavailable or your internet connection may be down.
            </p>
            <div className="bg-gray-50 p-4 rounded-lg mb-6 text-left">
              <p className="text-sm text-gray-700 font-semibold mb-2">Error details:</p>
              <p className="text-sm text-gray-600">{error}</p>
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If we have no data at all, show a different message
  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md mx-4">
          <div className="text-center">
            <div className="text-gray-500 text-6xl mb-4">📊</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">No Data Available</h2>
            <p className="text-gray-600 mb-6">
              No Pokemon data is currently available. Please check your internet connection and try refreshing the page.
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

  const stats = getStats();
  const topPvpPokemon = getTopPokemon('overall', 'great', 6);
  const topRaidPokemon = getTopPokemon('raid', 'all', 6);

  const handleSearch = (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    
    const results = searchPokemon(query);
    setSearchResults(results);
  };

  const handlePokemonSelect = (pokemon) => {
    const recommendation = getPokemonRecommendation(pokemon.id);
    setSelectedPokemon(recommendation);
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
            Discover which Pokemon are worth powering up by combining PVP rankings with raid effectiveness data. 
            Make informed decisions about your stardust and candy investments.
          </p>
          
          {data?.offline && (
            <div className="bg-yellow-500 text-yellow-900 px-4 py-2 rounded-lg inline-block mb-6">
              <span className="font-semibold">Offline Mode:</span> Using cached data
            </div>
          )}
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
                {selectedPokemon.pokemon.name} Analysis
              </h3>
              <PokemonCard pokemon={selectedPokemon} detailed={true} />
            </div>
          </div>
        )}

        {/* Quick Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 text-center">
              <div className="text-3xl font-bold text-white mb-2">{stats.totalPokemon}</div>
              <div className="text-blue-100">Total Pokemon</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 text-center">
              <div className="text-3xl font-bold text-white mb-2">{stats.pvpPokemon}</div>
              <div className="text-blue-100">PVP Ranked</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 text-center">
              <div className="text-3xl font-bold text-white mb-2">{stats.raidPokemon}</div>
              <div className="text-blue-100">Raid Ranked</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 text-center">
              <div className="text-3xl font-bold text-white mb-2">
                {stats.lastUpdated ? new Date(stats.lastUpdated).toLocaleDateString() : 'N/A'}
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
              Get the latest PVP rankings for Great League, Ultra League, and Master League 
              to dominate in trainer battles.
            </p>
            <div className="text-sm text-gray-500">
              Data from comprehensive battle simulations
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-xl p-6">
            <div className="text-4xl mb-4">🏆</div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">Raid Effectiveness</h3>
            <p className="text-gray-600 mb-4">
              Discover the most effective raid attackers with DPS, TDO, and eDPS calculations 
              for optimal raid performance.
            </p>
            <div className="text-sm text-gray-500">
              Advanced metrics for raid optimization
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-xl p-6">
            <div className="text-4xl mb-4">💎</div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">Investment Guide</h3>
            <p className="text-gray-600 mb-4">
              Smart recommendations on which Pokemon deserve your precious stardust 
              and rare candies based on overall performance.
            </p>
            <div className="text-sm text-gray-500">
              Maximize your resource efficiency
            </div>
          </div>
        </div>

        {/* Top Pokemon Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top PVP Pokemon */}
          <div className="bg-white rounded-lg shadow-xl p-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <span className="text-2xl mr-2">⚔️</span>
              Top PVP Pokemon (Great League)
            </h3>
            <div className="space-y-4">
              {topPvpPokemon.length > 0 ? (
                topPvpPokemon.map((pokemon, index) => (
                  <div key={pokemon.id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="text-lg font-bold text-gray-600 w-8">#{index + 1}</div>
                      <div>
                        <div className="font-semibold text-gray-800">{pokemon.name}</div>
                        <div className="text-sm text-gray-600">
                          Score: {pokemon.score || 'N/A'} | Types: {pokemon.types?.join(', ') || 'Unknown'}
                        </div>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      getTierColor(pokemon.tier || 'C')
                    }`}>
                      {pokemon.tier || 'C'}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <div className="text-4xl mb-2">🔄</div>
                  <p>Loading PVP rankings...</p>
                </div>
              )}
            </div>
          </div>

          {/* Top Raid Pokemon */}
          <div className="bg-white rounded-lg shadow-xl p-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <span className="text-2xl mr-2">🏆</span>
              Top Raid Attackers
            </h3>
            <div className="space-y-4">
              {topRaidPokemon.length > 0 ? (
                topRaidPokemon.map((pokemon, index) => (
                  <div key={pokemon.id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="text-lg font-bold text-gray-600 w-8">#{index + 1}</div>
                      <div>
                        <div className="font-semibold text-gray-800">{pokemon.name}</div>
                        <div className="text-sm text-gray-600">
                          eDPS: {pokemon.metrics?.edps?.toFixed(1) || 'N/A'} | Types: {pokemon.types?.join(', ') || 'Unknown'}
                        </div>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      getTierColor(pokemon.tier || 'C')
                    }`}>
                      {pokemon.tier || 'C'}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <div className="text-4xl mb-2">🔄</div>
                  <p>Loading raid rankings...</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="mt-16 bg-white rounded-lg shadow-xl p-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">How It Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl mb-4">📊</div>
              <h4 className="text-lg font-semibold text-gray-800 mb-2">Data Collection</h4>
              <p className="text-gray-600">
                We gather the latest Pokemon GO game data, PVP rankings, and raid effectiveness metrics 
                from multiple reliable sources.
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">🧮</div>
              <h4 className="text-lg font-semibold text-gray-800 mb-2">Analysis Engine</h4>
              <p className="text-gray-600">
                Our algorithms combine PVP performance across all leagues with raid DPS, TDO, and eDPS 
                calculations to generate comprehensive scores.
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">💡</div>
              <h4 className="text-lg font-semibold text-gray-800 mb-2">Smart Recommendations</h4>
              <p className="text-gray-600">
                Get personalized investment advice with star ratings and resource allocation suggestions 
                based on your Pokemon's overall competitive value.
              </p>
            </div>
          </div>
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