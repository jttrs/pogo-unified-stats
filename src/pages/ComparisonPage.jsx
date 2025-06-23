import React, { useState } from 'react'
import { Plus, X, GitCompare } from 'lucide-react'
import SearchBar from '../components/SearchBar'
import StatsChart from '../components/StatsChart'
import { useData } from '../context/DataContext'

const ComparisonPage = () => {
  const [selectedPokemon, setSelectedPokemon] = useState([])
  const { getPokemonData } = useData()

  const addPokemon = (pokemonName) => {
    if (selectedPokemon.length >= 4) {
      alert('You can compare up to 4 Pokemon at once')
      return
    }

    const data = getPokemonData(pokemonName)
    if (data.pvp && Object.keys(data.pvp).length > 0) {
      const pokemon = {
        name: pokemonName,
        pvp: data.pvp,
        raid: data.raid
      }
      setSelectedPokemon([...selectedPokemon, pokemon])
    }
  }

  const removePokemon = (index) => {
    setSelectedPokemon(selectedPokemon.filter((_, i) => i !== index))
  }

  const getTypeColor = (type) => {
    if (!type) return 'bg-gray-400'
    return `type-${type.toLowerCase()}`
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center mb-4">
          <GitCompare className="w-8 h-8 text-pogo-blue mr-3" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Pokemon Comparison</h1>
            <p className="text-gray-600">Compare up to 4 Pokemon side by side</p>
          </div>
        </div>

        <SearchBar 
          onSearch={addPokemon}
          placeholder="Search and add Pokemon to compare..."
        />
      </div>

      {/* Selected Pokemon */}
      {selectedPokemon.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Comparing {selectedPokemon.length} Pokemon</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {selectedPokemon.map((pokemon, index) => {
              const bestPvp = getBestPvpLeague(pokemon)
              const cleanName = pokemon.name.replace(/\s*\([^)]*\)/g, '')
              
              return (
                <div key={index} className="border rounded-lg p-4 relative">
                  <button
                    onClick={() => removePokemon(index)}
                    className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  
                  <h3 className="font-semibold text-lg mb-2">{cleanName}</h3>
                  
                  {bestPvp && (
                    <div className="space-y-2">
                      <div className="flex space-x-1">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${getTypeColor(bestPvp.data['Type 1'])}`}>
                          {bestPvp.data['Type 1']}
                        </span>
                        {bestPvp.data['Type 2'] && bestPvp.data['Type 2'] !== 'none' && (
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${getTypeColor(bestPvp.data['Type 2'])}`}>
                            {bestPvp.data['Type 2']}
                          </span>
                        )}
                      </div>
                      
                      <div className="text-sm space-y-1">
                        <div className="flex justify-between">
                          <span>Best Score:</span>
                          <span className="font-semibold">{parseFloat(bestPvp.data.Score).toFixed(1)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Best League:</span>
                          <span className="font-semibold">{bestPvp.league.toUpperCase()}</span>
                        </div>
                        {pokemon.raid && (
                          <div className="flex justify-between">
                            <span>Raid Tier:</span>
                            <span className="font-semibold">{pokemon.raid.tier}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
            
            {/* Add Pokemon Card */}
            {selectedPokemon.length < 4 && (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex items-center justify-center min-h-32">
                <div className="text-center text-gray-500">
                  <Plus className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm">Add Pokemon</p>
                </div>
              </div>
            )}
          </div>

          {/* Detailed Comparison */}
          {selectedPokemon.length >= 2 && (
            <div className="space-y-6">
              {/* Stats Comparison Table */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Stats Comparison</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-300 px-4 py-2 text-left">Pokemon</th>
                        <th className="border border-gray-300 px-4 py-2 text-center">Best Score</th>
                        <th className="border border-gray-300 px-4 py-2 text-center">Attack</th>
                        <th className="border border-gray-300 px-4 py-2 text-center">Defense</th>
                        <th className="border border-gray-300 px-4 py-2 text-center">Stamina</th>
                        <th className="border border-gray-300 px-4 py-2 text-center">CP</th>
                        <th className="border border-gray-300 px-4 py-2 text-center">Raid Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedPokemon.map((pokemon, index) => {
                        const bestPvp = getBestPvpLeague(pokemon)
                        return (
                          <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="border border-gray-300 px-4 py-2 font-semibold">
                              {pokemon.name.replace(/\s*\([^)]*\)/g, '')}
                            </td>
                            <td className="border border-gray-300 px-4 py-2 text-center">
                              {bestPvp ? parseFloat(bestPvp.data.Score).toFixed(1) : 'N/A'}
                            </td>
                            <td className="border border-gray-300 px-4 py-2 text-center">
                              {bestPvp ? bestPvp.data.Attack : 'N/A'}
                            </td>
                            <td className="border border-gray-300 px-4 py-2 text-center">
                              {bestPvp ? bestPvp.data.Defense : 'N/A'}
                            </td>
                            <td className="border border-gray-300 px-4 py-2 text-center">
                              {bestPvp ? bestPvp.data.Stamina : 'N/A'}
                            </td>
                            <td className="border border-gray-300 px-4 py-2 text-center">
                              {bestPvp ? bestPvp.data.CP : 'N/A'}
                            </td>
                            <td className="border border-gray-300 px-4 py-2 text-center">
                              {pokemon.raid ? pokemon.raid.score : 'N/A'}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Visual Comparison */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Visual Comparison</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {selectedPokemon.slice(0, 2).map((pokemon, index) => (
                    <StatsChart key={index} pokemon={pokemon} type="radar" />
                  ))}
                </div>
              </div>

              {/* League Performance */}
              <div>
                <h3 className="text-lg font-semibold mb-4">League Performance</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {['cp1500', 'cp2500', 'cp10000', 'premier'].map(league => (
                    <div key={league} className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold mb-3 text-center">{league.toUpperCase()}</h4>
                      <div className="space-y-2">
                        {selectedPokemon.map((pokemon, index) => {
                          const leagueData = pokemon.pvp[league]
                          return (
                            <div key={index} className="flex justify-between items-center">
                              <span className="text-sm truncate">
                                {pokemon.name.replace(/\s*\([^)]*\)/g, '').substring(0, 12)}...
                              </span>
                              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                leagueData ? (
                                  parseFloat(leagueData.Score) >= 90 ? 'tier-s' :
                                  parseFloat(leagueData.Score) >= 80 ? 'tier-a' :
                                  parseFloat(leagueData.Score) >= 70 ? 'tier-b' :
                                  'tier-c'
                                ) : 'bg-gray-300 text-gray-600'
                              }`}>
                                {leagueData ? parseFloat(leagueData.Score).toFixed(1) : 'N/A'}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {selectedPokemon.length === 0 && (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <GitCompare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">No Pokemon Selected</h2>
          <p className="text-gray-600 mb-4">
            Use the search bar above to add Pokemon to compare their stats and performance.
          </p>
          <p className="text-sm text-gray-500">
            You can compare up to 4 Pokemon at once to make informed investment decisions.
          </p>
        </div>
      )}
    </div>
  )
}

export default ComparisonPage 