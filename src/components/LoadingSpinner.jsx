import React from 'react';

const LoadingSpinner = ({ progress = 0, stage = 'loading', status = 'Loading...' }) => {
  const getStageIcon = (currentStage) => {
    switch (currentStage) {
      case 'initializing':
        return '🎮';
      case 'fetching':
        return '📡';
      case 'processing':
        return '⚙️';
      case 'fallback':
        return '💾';
      case 'complete':
        return '✅';
      default:
        return '🔄';
    }
  };

  const getStageDescription = (currentStage) => {
    switch (currentStage) {
      case 'initializing':
        return 'Starting up the application';
      case 'fetching':
        return 'Downloading data from Pokemon GO APIs';
      case 'processing':
        return 'Analyzing Pokemon stats and rankings';
      case 'fallback':
        return 'Loading cached data';
      case 'complete':
        return 'Ready to explore Pokemon data!';
      default:
        return 'Loading Pokemon data';
    }
  };

  const getProgressDetails = (currentStage, currentProgress) => {
    if (currentProgress < 25) {
      return [
        '🎯 Connecting to PoGoAPI for Game Master data',
        '📊 Preparing to fetch Pokemon stats and types',
        '🔧 Setting up data processing pipeline'
      ];
    } else if (currentProgress < 50) {
      return [
        '✅ Game Master data loaded successfully',
        '⚔️ Fetching PVP rankings from multiple leagues',
        '🏆 Calculating raid effectiveness metrics'
      ];
    } else if (currentProgress < 75) {
      return [
        '✅ PVP rankings loaded for all leagues',
        '🧮 Computing DPS, TDO, and eDPS values',
        '📈 Generating tier rankings and recommendations'
      ];
    } else if (currentProgress < 95) {
      return [
        '✅ Raid effectiveness calculations complete',
        '🔄 Organizing and indexing Pokemon data',
        '💎 Preparing investment recommendations'
      ];
    } else {
      return [
        '✅ All data sources loaded successfully',
        '🎉 Pokemon database ready for exploration',
        '🚀 Launching Pokemon GO Investment Guide'
      ];
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4 animate-bounce">
            {getStageIcon(stage)}
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Pokemon GO Investment Guide
          </h2>
          <p className="text-gray-600">
            {getStageDescription(stage)}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span className="font-medium">Loading Progress</span>
            <span className="font-bold">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500 ease-out relative"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 bg-white opacity-30 animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Status Message */}
        <div className="text-center mb-6">
          <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
            <div className="font-medium text-blue-800 mb-1">
              Current Status
            </div>
            <div className="text-blue-700 text-sm">
              {status}
            </div>
          </div>
        </div>

        {/* Progress Details */}
        <div className="space-y-3">
          <div className="text-sm font-medium text-gray-700 mb-3">
            What's happening:
          </div>
          {getProgressDetails(stage, progress).map((detail, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <div className="text-sm text-gray-600 leading-relaxed">
                {detail}
              </div>
            </div>
          ))}
        </div>

        {/* Stage Indicators */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex justify-between items-center text-xs">
            {['initializing', 'fetching', 'processing', 'complete'].map((stageItem, index) => (
              <div 
                key={stageItem}
                className={`flex flex-col items-center ${
                  stageItem === stage 
                    ? 'text-blue-600' 
                    : progress > (index + 1) * 25 
                      ? 'text-green-600' 
                      : 'text-gray-400'
                }`}
              >
                <div className={`w-3 h-3 rounded-full mb-1 ${
                  stageItem === stage 
                    ? 'bg-blue-600 animate-pulse' 
                    : progress > (index + 1) * 25 
                      ? 'bg-green-600' 
                      : 'bg-gray-300'
                }`}></div>
                <span className="capitalize font-medium">
                  {stageItem}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Fun Facts */}
        {progress < 90 && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="text-xs font-medium text-gray-700 mb-2">
              💡 Did you know?
            </div>
            <div className="text-xs text-gray-600">
              {progress < 30 && "Pokemon GO has over 800 different Pokemon species available!"}
              {progress >= 30 && progress < 60 && "PVP rankings change based on CP limits for each league."}
              {progress >= 60 && progress < 90 && "Raid effectiveness depends on DPS, TDO, and type advantages."}
            </div>
          </div>
        )}

        {/* Error Fallback Message */}
        {stage === 'fallback' && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="text-xs text-yellow-800">
              <strong>Note:</strong> Using cached data due to connectivity issues. 
              Some information may not be the latest.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoadingSpinner; 