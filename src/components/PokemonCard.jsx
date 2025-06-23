import React from 'react'
import { Star, Zap, Shield, Heart, Swords, Sword, TrendingUp } from 'lucide-react'
import { useData } from '../context/DataContext'

const PokemonCard = ({ pokemon, detailed = false }) => {
  const { getRecommendation } = useData()
  
  if (!pokemon) return null

  // Handle both direct pokemon data and recommendation data
  const pokemonData = pokemon.pokemon || pokemon
  const recommendation = pokemon.recommendation
  const pvpPerformance = pokemon.pvp
  const raidPerformance = pokemon.raid
  const investment = pokemon.investment

  const cleanName = pokemonData.name?.replace(/\s*\([^)]*\)/g, '') || 'Unknown Pokemon'

  // Get best PVP performance across all leagues
  const getBestPvpPerformance = () => {
    if (!pvpPerformance || Object.keys(pvpPerformance).length === 0) {
      return { league: null, score: 0, data: null }
    }

    let bestLeague = null
    let bestScore = 0
    let bestData = null

    Object.entries(pvpPerformance).forEach(([league, data]) => {
      const score = parseFloat(data.Score) || 0
      if (score > bestScore) {
        bestScore = score
        bestLeague = league
        bestData = data
      }
    })

    return { league: bestLeague, score: bestScore, data: bestData }
  }

  const bestPvp = getBestPvpPerformance()

  // Get type colors
  const getTypeColor = (type) => {
    const typeColors = {
      'Normal': 'bg-gray-400',
      'Fire': 'bg-red-500',
      'Water': 'bg-blue-500',
      'Electric': 'bg-yellow-400',
      'Grass': 'bg-green-500',
      'Ice': 'bg-cyan-400',
      'Fighting': 'bg-orange-600',
      'Poison': 'bg-purple-500',
      'Ground': 'bg-amber-600',
      'Flying': 'bg-indigo-400',
      'Psychic': 'bg-pink-500',
      'Bug': 'bg-lime-500',
      'Rock': 'bg-stone-600',
      'Ghost': 'bg-violet-600',
      'Dragon': 'bg-indigo-700',
      'Dark': 'bg-gray-700',
      'Steel': 'bg-slate-500',
      'Fairy': 'bg-rose-400'
    }
    return typeColors[type] || 'bg-gray-400'
  }

  // Get tier color
  const getTierColor = (tier) => {
    if (!tier) return 'bg-gray-400 text-white'
    const tierLower = tier.toLowerCase()
    if (tierLower.includes('s+')) return 'tier-s-plus'
    if (tierLower.includes('s')) return 'tier-s'
    if (tierLower.includes('a')) return 'tier-a'
    if (tierLower.includes('b')) return 'tier-b'
    return 'tier-c'
  }

  // Format league name for display
  const formatLeagueName = (league) => {
    const leagueMap = {
      'cp1500': 'Great League',
      'cp2500': 'Ultra League', 
      'cp10000': 'Master League',
      'premier': 'Premier Cup'
    }
    return leagueMap[league] || league?.toUpperCase()
  }

  const renderStars = (count) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < count 
            ? 'text-yellow-400 fill-current' 
            : 'text-gray-300'
        }`}
      />
    ))
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'medium-high':
        return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'low':
        return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'very-low':
        return 'text-red-600 bg-red-50 border-red-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  if (detailed && recommendation) {
    return (
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold">{cleanName}</h3>
              <div className="flex items-center gap-2 mt-2">
                {pokemonData.types?.map((type, index) => (
                  <span
                    key={index}
                    className={`px-3 py-1 rounded-full text-sm font-medium text-white ${getTypeColor(type)}`}
                  >
                    {type}
                  </span>
                ))}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm opacity-75">Pokemon #{pokemonData.id}</div>
              {investment && (
                <div className="flex items-center gap-1 mt-1">
                  {renderStars(investment.stars)}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        {pokemonData.stats && (
          <div className="p-6 border-b border-gray-200">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Base Stats</h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{pokemonData.stats.attack}</div>
                <div className="text-sm text-gray-600">Attack</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{pokemonData.stats.defense}</div>
                <div className="text-sm text-gray-600">Defense</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{pokemonData.stats.stamina}</div>
                <div className="text-sm text-gray-600">Stamina</div>
              </div>
            </div>
          </div>
        )}

        {/* Performance Summary */}
        <div className="p-6 border-b border-gray-200">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Performance Overview</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Overall Recommendation */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-700">Overall Rating</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getTierColor(recommendation.tier)}`}>
                  {recommendation.tier}
                </span>
              </div>
              <div className="text-2xl font-bold text-gray-800">{recommendation.score}/100</div>
            </div>

            {/* Investment Priority */}
            {investment && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-700">Investment Priority</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getPriorityColor(investment.priority)}`}>
                    {investment.priority.replace('-', ' ')}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {renderStars(investment.stars)}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* PVP Performance */}
        {pvpPerformance && (
          <div className="p-6 border-b border-gray-200">
            <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Sword className="w-5 h-5 mr-2" />
              PVP Performance
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(pvpPerformance).map(([league, performance]) => (
                <div key={league} className="bg-gray-50 rounded-lg p-4">
                  <div className="font-medium text-gray-700 capitalize mb-2">{league} League</div>
                  {performance ? (
                    <>
                      <div className="text-lg font-bold text-gray-800">Rank #{performance.rank}</div>
                      <div className="text-sm text-gray-600">Score: {performance.score}</div>
                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium mt-1 ${getTierColor(performance.tier)}`}>
                        {performance.tier}
                      </span>
                    </>
                  ) : (
                    <div className="text-gray-500 text-sm">Not ranked</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Raid Performance */}
        {raidPerformance && (
          <div className="p-6 border-b border-gray-200">
            <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Zap className="w-5 h-5 mr-2" />
              Raid Effectiveness
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="font-medium text-gray-700 mb-2">DPS</div>
                <div className="text-lg font-bold text-red-600">
                  {raidPerformance.metrics?.dps?.toFixed(1) || 'N/A'}
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="font-medium text-gray-700 mb-2">TDO</div>
                <div className="text-lg font-bold text-blue-600">
                  {raidPerformance.metrics?.tdo?.toFixed(1) || 'N/A'}
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="font-medium text-gray-700 mb-2">eDPS</div>
                <div className="text-lg font-bold text-green-600">
                  {raidPerformance.metrics?.edps?.toFixed(1) || 'N/A'}
                </div>
              </div>
            </div>
            <div className="mt-4">
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getTierColor(raidPerformance.tier)}`}>
                Raid Tier: {raidPerformance.tier}
              </span>
            </div>
          </div>
        )}

        {/* Investment Recommendation */}
        {investment && (
          <div className="p-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Investment Recommendation
            </h4>
            <div className={`rounded-lg p-4 border ${getPriorityColor(investment.priority)}`}>
              <div className="font-medium mb-2">{investment.message}</div>
              <div className="text-sm">{investment.resources}</div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Simple card view
  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden">
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-800">{cleanName}</h3>
          {pokemonData.id && (
            <span className="text-sm text-gray-500">#{pokemonData.id}</span>
          )}
        </div>

        {/* Types */}
        {pokemonData.types && (
          <div className="flex flex-wrap gap-1 mb-3">
            {pokemonData.types.map((type, index) => (
              <span
                key={index}
                className={`px-2 py-1 rounded text-xs font-medium text-white ${getTypeColor(type)}`}
              >
                {type}
              </span>
            ))}
          </div>
        )}

        {/* Stats */}
        {pokemonData.stats && (
          <div className="grid grid-cols-3 gap-2 text-center mb-3">
            <div>
              <div className="text-sm font-bold text-red-600">{pokemonData.stats.attack}</div>
              <div className="text-xs text-gray-600">ATK</div>
            </div>
            <div>
              <div className="text-sm font-bold text-blue-600">{pokemonData.stats.defense}</div>
              <div className="text-xs text-gray-600">DEF</div>
            </div>
            <div>
              <div className="text-sm font-bold text-green-600">{pokemonData.stats.stamina}</div>
              <div className="text-xs text-gray-600">STA</div>
            </div>
          </div>
        )}

        {/* Performance indicators */}
        <div className="flex items-center justify-between">
          {recommendation && (
            <span className={`px-2 py-1 rounded text-xs font-medium ${getTierColor(recommendation.tier)}`}>
              {recommendation.tier}
            </span>
          )}
          {investment && (
            <div className="flex items-center gap-1">
              {renderStars(investment.stars)}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PokemonCard 