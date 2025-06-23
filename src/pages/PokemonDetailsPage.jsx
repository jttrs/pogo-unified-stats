import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { ArrowLeft, TrendingUp, Zap, Swords, Shield, Star } from 'lucide-react'
import { Link } from 'react-router-dom'
import StatsChart from '../components/StatsChart'
import { useData } from '../context/DataContext'

const PokemonDetailsPage = () => {
  const { name } = useParams()
  const [pokemon, setPokemon] = useState(null)
  const [loading, setLoading] = useState(true)
  const { getPokemonData } = useData()

  useEffect(() => {
    if (name) {
      const data = getPokemonData(decodeURIComponent(name))
      setPokemon({
        name: decodeURIComponent(name),
        pvp: data.pvp,
        raid: data.raid
      })
      setLoading(false)
    }
  }, [name, getPokemonData])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pogo-blue"></div>
      </div>
    )
  }

  if (!pokemon || (!pokemon.pvp || Object.keys(pokemon.pvp).length === 0)) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <Link to="/" className="flex items-center text-pogo-blue hover:text-pogo-red mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>
        <div className="text-center py-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Pokemon Not Found</h2>
          <p className="text-gray-600">The Pokemon "{name}" was not found in our database.</p>
        </div>
      </div>
    )
  }

  const cleanName = pokemon.name.replace(/\s*\([^)]*\)/g, '')
  const bestPvpLeague = getBestPvpLeague(pokemon)
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <Link to="/" className="flex items-center text-pogo-blue hover:text-pogo-red mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>
        
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{cleanName}</h1>
            <div className="flex space-x-2 mb-4">
              {bestPvpLeague && (
                <>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold type-${bestPvpLeague.data['Type 1']?.toLowerCase()}`}>
                    {bestPvpLeague.data['Type 1']}
                  </span>
                  {bestPvpLeague.data['Type 2'] && bestPvpLeague.data['Type 2'] !== 'none' && (
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold type-${bestPvpLeague.data['Type 2']?.toLowerCase()}`}>
                      {bestPvpLeague.data['Type 2']}
                    </span>
                  )}
                </>
              )}
            </div>
          </div>
          
          <div className="text-right">
            {bestPvpLeague && (
              <div className="text-2xl font-bold text-pogo-blue">
                {parseFloat(bestPvpLeague.data.Score).toFixed(1)}
              </div>
            )}
            {pokemon.raid && (
              <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold mt-2 ${
                pokemon.raid.tier === 'S+' ? 'tier-s' :
                pokemon.raid.tier === 'A' ? 'tier-a' :
                pokemon.raid.tier === 'B' ? 'tier-b' :
                'tier-c'
              }`}>
                Raid Tier {pokemon.raid.tier}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StatsChart pokemon={pokemon} type="bar" />
        <StatsChart pokemon={pokemon} type="radar" />
      </div>

      {/* League Rankings */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4">PVP League Rankings</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(pokemon.pvp).map(([league, data]) => (
            <div key={league} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold">{league.toUpperCase()}</h3>
                <div className={`px-2 py-1 rounded text-xs font-semibold ${
                  parseFloat(data.Score) >= 90 ? 'tier-s' :
                  parseFloat(data.Score) >= 80 ? 'tier-a' :
                  parseFloat(data.Score) >= 70 ? 'tier-b' :
                  'tier-c'
                }`}>
                  {parseFloat(data.Score).toFixed(1)}
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Attack:</span>
                  <span className="font-medium">{data.Attack}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Defense:</span>
                  <span className="font-medium">{data.Defense}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Stamina:</span>
                  <span className="font-medium">{data.Stamina}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">CP:</span>
                  <span className="font-medium">{data.CP}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Movesets */}
      {bestPvpLeague && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4">Best Movesets</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2 flex items-center">
                <Swords className="w-4 h-4 mr-2 text-blue-500" />
                Fast Move
              </h3>
              <p className="text-lg">{bestPvpLeague.data['Fast Move']}</p>
            </div>
            
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2 flex items-center">
                <Zap className="w-4 h-4 mr-2 text-yellow-500" />
                Charged Moves
              </h3>
              <div className="space-y-1">
                <p>{bestPvpLeague.data['Charged Move 1']}</p>
                {bestPvpLeague.data['Charged Move 2'] && (
                  <p>{bestPvpLeague.data['Charged Move 2']}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Investment Recommendation */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4 flex items-center">
          <TrendingUp className="w-6 h-6 mr-2 text-green-500" />
          Investment Recommendation
        </h2>
        
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-700">PVP Rating</div>
              <div className={`text-2xl font-bold ${
                bestPvpLeague && parseFloat(bestPvpLeague.data.Score) >= 85 ? 'text-green-600' :
                bestPvpLeague && parseFloat(bestPvpLeague.data.Score) >= 75 ? 'text-yellow-600' :
                'text-red-600'
              }`}>
                {bestPvpLeague ? `${parseFloat(bestPvpLeague.data.Score).toFixed(1)}/100` : 'N/A'}
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-700">Raid Rating</div>
              <div className={`text-2xl font-bold ${
                pokemon.raid && pokemon.raid.score >= 85 ? 'text-green-600' :
                pokemon.raid && pokemon.raid.score >= 75 ? 'text-yellow-600' :
                'text-red-600'
              }`}>
                {pokemon.raid ? `${pokemon.raid.score}/100` : 'N/A'}
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-700">Overall</div>
              <div className="flex justify-center">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < getOverallRating(pokemon) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
          
          <div className="border-t pt-4">
            <p className="text-lg font-medium text-gray-900 mb-2">
              {getRecommendationTitle(pokemon)}
            </p>
            <p className="text-gray-700">
              {getDetailedRecommendation(pokemon)}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

const getBestPvpLeague = (pokemon) => {
  if (!pokemon.pvp) return null
  
  const leagues = Object.keys(pokemon.pvp)
  if (leagues.length === 0) return null
  
  let bestLeague = leagues[0]
  let bestScore = parseFloat(pokemon.pvp[bestLeague].Score)
  
  leagues.forEach(league => {
    const score = parseFloat(pokemon.pvp[league].Score)
    if (score > bestScore) {
      bestScore = score
      bestLeague = league
    }
  })
  
  return { league: bestLeague, data: pokemon.pvp[bestLeague] }
}

const getOverallRating = (pokemon) => {
  const bestPvp = pokemon.pvp ? Object.values(pokemon.pvp)[0] : null
  const pvpScore = bestPvp ? parseFloat(bestPvp.Score) : 0
  const raidScore = pokemon.raid ? pokemon.raid.score : 0
  
  const avgScore = (pvpScore + raidScore) / 2
  
  if (avgScore >= 90) return 5
  if (avgScore >= 80) return 4
  if (avgScore >= 70) return 3
  if (avgScore >= 60) return 2
  return 1
}

const getRecommendationTitle = (pokemon) => {
  const rating = getOverallRating(pokemon)
  
  switch (rating) {
    case 5: return "⭐ Highly Recommended Investment"
    case 4: return "🎯 Great Investment Choice"
    case 3: return "👍 Solid Investment"
    case 2: return "⚠️ Consider Carefully"
    default: return "❌ Not Recommended"
  }
}

const getDetailedRecommendation = (pokemon) => {
  const bestPvp = pokemon.pvp ? Object.values(pokemon.pvp)[0] : null
  const pvpScore = bestPvp ? parseFloat(bestPvp.Score) : 0
  const raidScore = pokemon.raid ? pokemon.raid.score : 0
  
  if (pvpScore >= 85 && raidScore >= 85) {
    return "This Pokemon excels in both PVP and raids, making it an excellent all-around investment. Prioritize powering it up to maximize its potential in all game modes."
  } else if (pvpScore >= 85) {
    return "This Pokemon is a top-tier PVP performer. Focus on powering it up for competitive battles and consider investing in a second charge move for maximum effectiveness."
  } else if (raidScore >= 85) {
    return "This Pokemon is an exceptional raid attacker. Perfect for taking down raid bosses efficiently. Consider powering up multiple copies for raid teams."
  } else if (pvpScore >= 75 || raidScore >= 75) {
    return "This Pokemon performs well in specific situations. It's a solid investment if you need coverage for particular matchups or raid types."
  } else {
    return "This Pokemon has limited competitive value. Consider investing in other Pokemon unless this one has special significance to you or fills a specific niche in your collection."
  }
}

export default PokemonDetailsPage 