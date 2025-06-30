import React, { useState, useEffect } from 'react';

const LoadingSpinner = ({ loading, error, retryCount, onRetry, onClearCache, dataStatus }) => {
  const [currentPokemon, setCurrentPokemon] = useState(0);
  const [animationState, setAnimationState] = useState('running');

  // List of popular Pokemon for animation
  const pokemonList = [
    'pikachu', 'charizard', 'blastoise', 'venusaur', 'alakazam', 'machamp',
    'gengar', 'dragonite', 'mewtwo', 'mew', 'lugia', 'ho-oh', 'celebi',
    'kyogre', 'groudon', 'rayquaza', 'dialga', 'palkia', 'giratina',
    'arceus', 'victini', 'reshiram', 'zekrom', 'kyurem', 'genesect',
    'xerneas', 'yveltal', 'zygarde', 'volcanion', 'cosmog', 'lunala'
  ];

  useEffect(() => {
    if (loading && !error) {
      const interval = setInterval(() => {
        setCurrentPokemon(prev => (prev + 1) % pokemonList.length);
      }, 800);

      return () => clearInterval(interval);
    }
  }, [loading, error, pokemonList.length]);

  // Show error state when data fails to load
  if (error) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex flex-col items-center justify-center z-50">
        <div className="text-center p-8 bg-black/20 backdrop-blur-sm rounded-xl border border-white/10 max-w-md mx-4">
          {/* Error Icon */}
          <div className="mb-6">
            <div className="w-16 h-16 mx-auto bg-red-500/20 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
          </div>

          {/* Error Message */}
          <h2 className="text-2xl font-bold text-white mb-4">Unable to Load Data</h2>
          <p className="text-white/80 mb-6 leading-relaxed">
            We couldn't fetch real Pokemon GO data from PVPoke or DialgaDex. This app only shows authentic data from these sources.
          </p>
          
          {/* Error Details */}
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
            <p className="text-red-200 text-sm">
              <strong>Error:</strong> {error}
            </p>
            {retryCount > 0 && (
              <p className="text-red-300 text-xs mt-2">
                Retry attempts: {retryCount}/3
              </p>
            )}
          </div>

          {/* Data Status */}
          {dataStatus && (
            <div className="bg-white/5 rounded-lg p-4 mb-6">
              <h3 className="text-white font-semibold mb-3">Data Sources Status:</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {Object.entries(dataStatus).map(([source, status]) => (
                  <div key={source} className="flex items-center justify-between">
                    <span className="text-white/70 capitalize">
                      {source.replace(/([A-Z])/g, ' $1').trim()}:
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      status === 'success' ? 'bg-green-500/20 text-green-300' :
                      status === 'loading' ? 'bg-blue-500/20 text-blue-300' :
                      'bg-red-500/20 text-red-300'
                    }`}>
                      {status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            {retryCount < 3 && (
              <button
                onClick={onRetry}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Retry Loading Data
              </button>
            )}
            
            <button
              onClick={onClearCache}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Clear Cache & Retry
            </button>

            <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <p className="text-yellow-200 text-sm">
                <strong>Note:</strong> This app fetches live data from PVPoke.com and DialgaDex.com. 
                Network issues or API changes may prevent data loading.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state with Pokemon animation
  if (loading) {
    const currentPokemonName = pokemonList[currentPokemon];

    return (
      <div className="fixed inset-0 bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex flex-col items-center justify-center z-50 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Animated background elements */}
          <div className="absolute top-10 left-10 w-4 h-4 bg-white/10 rounded-full animate-pulse"></div>
          <div className="absolute top-32 right-20 w-2 h-2 bg-blue-300/20 rounded-full animate-ping"></div>
          <div className="absolute bottom-20 left-16 w-3 h-3 bg-purple-300/15 rounded-full animate-bounce"></div>
          <div className="absolute bottom-40 right-12 w-2 h-2 bg-white/10 rounded-full animate-pulse"></div>
        </div>

        {/* Main content */}
        <div className="text-center z-10">
          {/* Pokemon sprite animation */}
          <div className="relative mb-8">
            <div className="flex items-center justify-center">
              {/* Running path/track */}
              <div className="w-80 h-2 bg-white/10 rounded-full relative overflow-hidden mb-4">
                <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500/50 to-purple-500/50 rounded-full animate-pulse w-1/3"></div>
              </div>
            </div>
            
            {/* Pokemon sprite container */}
            <div className="relative h-24 flex items-center justify-center">
              <div className="relative">
                {/* Dust cloud effect */}
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                  <div className="flex space-x-1">
                    <div className="w-1 h-1 bg-white/30 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-1 h-1 bg-white/20 rounded-full animate-bounce" style={{ animationDelay: '100ms' }}></div>
                    <div className="w-1 h-1 bg-white/10 rounded-full animate-bounce" style={{ animationDelay: '200ms' }}></div>
                  </div>
                </div>
                
                {/* Pokemon sprite */}
                <img
                  src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${currentPokemon + 1}.png`}
                  alt={currentPokemonName}
                  className="w-16 h-16 pixelated animate-bounce drop-shadow-lg"
                  style={{
                    imageRendering: 'pixelated',
                    filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))'
                  }}
                />
                
                {/* Name bubble */}
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
                  <div className="bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium border border-white/20 whitespace-nowrap">
                    {currentPokemonName}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Loading text */}
          <h2 className="text-3xl font-bold text-white mb-4">
            Loading Pokemon GO Data
          </h2>
          <p className="text-blue-200 mb-8 max-w-md mx-auto leading-relaxed">
            Fetching real-time data from PVPoke and DialgaDex...
          </p>

          {/* Data Status Indicators */}
          {dataStatus && (
            <div className="bg-black/20 backdrop-blur-sm rounded-xl p-6 border border-white/10 max-w-md mx-auto">
              <h3 className="text-white font-semibold mb-4">Loading Progress</h3>
              <div className="space-y-3">
                {Object.entries(dataStatus).map(([source, status]) => (
                  <div key={source} className="flex items-center justify-between">
                    <span className="text-white/80 text-sm capitalize">
                      {source.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        status === 'success' ? 'bg-green-500/20 text-green-300' :
                        status === 'loading' ? 'bg-blue-500/20 text-blue-300' :
                        'bg-gray-500/20 text-gray-300'
                      }`}>
                        {status}
                      </span>
                      {status === 'loading' && (
                        <div className="w-3 h-3 border border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Loading animation dots */}
          <div className="flex justify-center space-x-2 mt-8">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default LoadingSpinner;