import React, { createContext, useContext, useState, useEffect } from 'react'
import PVPokeDataService from '../services/pvpokeDataService'

const DataContext = createContext()

export const useData = () => {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error('useData must be used within a DataProvider')
  }
  return context
}

export const DataProvider = ({ children }) => {
  const [data, setData] = useState(null)
  const [database, setDatabase] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)

  const pvpokeService = new PVPokeDataService()

  // Initialize data service and fetch comprehensive database
  useEffect(() => {
    initializeData()
  }, [])

  const initializeData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('🚀 Initializing comprehensive Pokemon database...')
      console.log('🔍 DataContext: Starting data initialization')
      
      // Skip connectivity test for now - using fallback data
      // await pvpokeService.testConnectivity()
      
      // Fetch comprehensive database from PVPoke
      console.log('🔍 DataContext: Calling getComprehensiveDatabase...')
      const comprehensiveDb = await pvpokeService.getComprehensiveDatabase()
      
      console.log('🔍 DataContext: Got comprehensive database result:', {
        hasDatabase: !!comprehensiveDb,
        hasPokemon: !!comprehensiveDb?.pokemon,
        hasRankings: !!comprehensiveDb?.rankings,
        pokemonCount: Object.keys(comprehensiveDb?.pokemon || {}).length,
        rankingsCount: Object.keys(comprehensiveDb?.rankings?.leagues || {}).length,
        samplePokemonIds: Object.keys(comprehensiveDb?.pokemon || {}).slice(0, 5)
      })
      
      if (!comprehensiveDb) {
        throw new Error('Failed to fetch comprehensive database')
      }

      console.log('📋 Raw database structure:', {
        hasDatabase: !!comprehensiveDb,
        hasPokemon: !!comprehensiveDb.pokemon,
        hasRankings: !!comprehensiveDb.rankings,
        pokemonCount: Object.keys(comprehensiveDb.pokemon || {}).length,
        movesCount: Object.keys(comprehensiveDb.moves || {}).length,
        leaguesCount: Object.keys(comprehensiveDb.rankings?.leagues || {}).length,
        metadata: comprehensiveDb.metadata
      });

      // Set the database
      setDatabase(comprehensiveDb)
      
      // Create legacy data structure for backward compatibility
      console.log('🔍 DataContext: Creating legacy data structure...')
      const legacyData = createLegacyDataStructure(comprehensiveDb)
      console.log('🔍 DataContext: Legacy data created:', {
        hasLegacyData: !!legacyData,
        hasPvpRankings: !!legacyData?.pvpRankings,
        pvpRankingsKeys: Object.keys(legacyData?.pvpRankings || {}),
        pvpRankingCounts: Object.entries(legacyData?.pvpRankings || {}).map(([league, data]) => 
          `${league}: ${Array.isArray(data) ? data.length : 'not array'}`
        )
      })
      setData(legacyData)
      
      setLastUpdated(new Date().toISOString())
      
      console.log('✅ Successfully initialized Pokemon database!')
      console.log('📊 Database contains:', {
        pokemon: Object.keys(comprehensiveDb.pokemon || {}).length,
        moves: Object.keys(comprehensiveDb.moves || {}).length,
        leagues: Object.keys(comprehensiveDb.rankings?.leagues || {}).length,
        usingFallback: comprehensiveDb.metadata?.fallbackUsed || false
      })
      
    } catch (error) {
      console.error('❌ Failed to initialize data:', error)
      console.error('❌ DataContext: Error details:', {
        message: error.message,
        stack: error.stack
      })
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  // Create legacy data structure for backward compatibility
  const createLegacyDataStructure = (comprehensiveDb) => {
    console.log('🔍 createLegacyDataStructure: Input data structure:', {
      hasRankings: !!comprehensiveDb?.rankings,
      hasLeagues: !!comprehensiveDb?.rankings?.leagues,
      leagueKeys: Object.keys(comprehensiveDb?.rankings?.leagues || {}),
      sampleLeague: comprehensiveDb?.rankings?.leagues?.great ? {
        hasCategories: !!comprehensiveDb.rankings.leagues.great.categories,
        hasOverall: !!comprehensiveDb.rankings.leagues.great.categories?.overall,
        overallLength: comprehensiveDb.rankings.leagues.great.categories?.overall?.length
      } : 'no great league data'
    })

    const legacyData = {
      pvp: {}, // For RankingsPage compatibility  
      pvpRankings: {}, // For backward compatibility
      gamemaster: comprehensiveDb,
      lastUpdated: new Date().toISOString(),
      dataStatus: {
        greatLeague: 'success',
        ultraLeague: 'success',
        masterLeague: 'success',
        gamemaster: 'success'
      }
    }

    // Map league keys to match RankingsPage expectations
    const leagueMapping = {
      'great': 'cp1500',
      'ultra': 'cp2500', 
      'master': 'cp10000'
    }

    // Check if rankings structure exists
    if (!comprehensiveDb.rankings || !comprehensiveDb.rankings.leagues) {
      console.warn('🔍 createLegacyDataStructure: No rankings.leagues found in data')
      return legacyData
    }

    // Convert new ranking structure to legacy format
    Object.entries(comprehensiveDb.rankings.leagues).forEach(([leagueKey, league]) => {
      console.log(`🔍 createLegacyDataStructure: Processing league ${leagueKey}:`, {
        hasLeagueData: !!league,
        hasCategories: !!league?.categories,
        hasOverall: !!league?.categories?.overall,
        overallLength: league?.categories?.overall?.length,
        samplePokemon: league?.categories?.overall?.[0]
      })

      if (league.categories && league.categories.overall) {
        console.log(`🔍 createLegacyDataStructure: Converting ${league.categories.overall.length} Pokemon for ${leagueKey}`)
        
        const convertedPokemon = league.categories.overall.map(pokemon => ({
          Pokemon: pokemon.speciesName,
          speciesId: pokemon.speciesId,
          Score: pokemon.score,
          rank: pokemon.rank,
          'Type 1': comprehensiveDb.pokemon[pokemon.speciesId]?.types[0] || 'Normal',
          'Type 2': comprehensiveDb.pokemon[pokemon.speciesId]?.types[1] || 'none',
          Attack: comprehensiveDb.pokemon[pokemon.speciesId]?.baseStats?.atk || 100,
          Defense: comprehensiveDb.pokemon[pokemon.speciesId]?.baseStats?.def || 100,
          Stamina: comprehensiveDb.pokemon[pokemon.speciesId]?.baseStats?.hp || 100,
          CP: pokemon.cp,
          'Fast Move': pokemon.moves?.fastMove || 'Unknown',
          'Charged Move 1': pokemon.moves?.chargedMove1 || 'Unknown',
          'Charged Move 2': pokemon.moves?.chargedMove2 || ''
        }))
        
        // Store in both formats for compatibility
        legacyData.pvpRankings[leagueKey] = convertedPokemon // Original format
        
        // Map to RankingsPage expected format
        const mappedLeagueKey = leagueMapping[leagueKey] || leagueKey
        legacyData.pvp[mappedLeagueKey] = convertedPokemon // RankingsPage format
        
        console.log(`✅ createLegacyDataStructure: Successfully converted ${convertedPokemon.length} Pokemon for ${leagueKey} (mapped to ${mappedLeagueKey})`)
      } else {
        console.warn(`🔍 createLegacyDataStructure: No overall category found for ${leagueKey}`)
      }
    })

    console.log('🔍 createLegacyDataStructure: Final legacy data:', {
      pvpRankingsKeys: Object.keys(legacyData.pvpRankings),
      pvpKeys: Object.keys(legacyData.pvp),
      pvpRankingCounts: Object.entries(legacyData.pvpRankings).map(([league, data]) => 
        `${league}: ${data.length}`
      ),
      pvpCounts: Object.entries(legacyData.pvp).map(([league, data]) => 
        `${league}: ${data.length}`
      )
    })

    return legacyData
  }

  // Refresh data
  const refreshData = async () => {
    pvpokeService.clearCache()
    await initializeData()
  }

  // Search Pokemon in database
  const searchPokemon = (query) => {
    if (!database || !database.pokemon) return []
    
    // Simple search implementation for fallback data
    const allPokemon = getAllPokemon()
    const lowerQuery = query.toLowerCase()
    
    return allPokemon.filter(pokemon => 
      pokemon.speciesName?.toLowerCase().includes(lowerQuery) ||
      pokemon.name?.toLowerCase().includes(lowerQuery) ||
      pokemon.speciesId?.toLowerCase().includes(lowerQuery)
    )
  }

  // Get Pokemon by league
  const getPokemonByLeague = (league, limit = 50) => {
    if (!database) return []
    return pvpokeService.getPokemonByLeague(database, league, limit)
  }

  // Get top performers
  const getTopPerformers = (limit = 20) => {
    if (!database) return []
    return pvpokeService.getTopPerformers(database, limit)
  }

  // Get all Pokemon (legacy function)
  const getAllPokemon = () => {
    if (!database || !database.pokemon) return []
    return Object.values(database.pokemon).map(pokemon => ({
      ...pokemon,
      name: pokemon.speciesName || pokemon.name, // Ensure name property exists
      id: pokemon.speciesId || pokemon.id
    }))
  }

  // Get Pokemon by ID (legacy function)
  const getPokemonById = (id) => {
    if (!database || !id) return null
    
    // Try direct lookup first
    if (database.pokemon[id]) {
      return database.pokemon[id]
    }
    
    // Search by species name or other identifiers
    const allPokemon = Object.values(database.pokemon)
    return allPokemon.find(pokemon => 
      pokemon.speciesId === id || 
      pokemon.speciesName === id ||
      pokemon.dex?.toString() === id?.toString()
    ) || null
  }

  // Get league rankings (legacy function)
  const getLeagueRankings = (league) => {
    if (!data?.pvpRankings || !league) return []
    
    const rankings = data.pvpRankings[league]
    return Array.isArray(rankings) ? rankings : []
  }

  // Calculate PVP Performance (enhanced)
  const calculatePVPPerformance = (pokemon) => {
    if (!pokemon || !database) return null
    
    try {
      const performance = {
        overall: 0,
        leagues: {}
      }
      
      let totalScore = 0
      let leagueCount = 0
      
      // Use the new database structure
      if (pokemon.rankings) {
        Object.entries(pokemon.rankings).forEach(([league, ranking]) => {
          const score = Math.round(ranking.score || 0)
          performance.leagues[league] = {
            rank: ranking.rank || 999,
            score: score,
            total: database.rankings.leagues[league]?.categories?.overall?.length || 0,
            rating: ranking.rating || 0
          }
          
          totalScore += score
          leagueCount++
        })
      } else {
        // Fallback to legacy method
        ['great', 'ultra', 'master'].forEach(league => {
          const rankings = getLeagueRankings(league)
          if (!rankings || rankings.length === 0) return
          
          const pokemonInLeague = rankings.find(p => 
            p && (p.speciesId === pokemon.speciesId || p.speciesId === pokemon.id)
          )
          
          if (pokemonInLeague) {
            const rank = pokemonInLeague.rank || 999
            const score = Math.max(0, 100 - (rank - 1) * (100 / rankings.length))
            
            performance.leagues[league] = {
              rank: rank,
              score: Math.round(score),
              total: rankings.length
            }
            
            totalScore += score
            leagueCount++
          } else {
            performance.leagues[league] = {
              rank: null,
              score: 0,
              total: rankings.length
            }
          }
        })
      }
      
      performance.overall = leagueCount > 0 ? Math.round(totalScore / leagueCount) : 0
      return performance
      
    } catch (error) {
      console.error('Error calculating PVP performance:', error)
      return {
        overall: 0,
        leagues: {
          great: { rank: null, score: 0, total: 0 },
          ultra: { rank: null, score: 0, total: 0 },
          master: { rank: null, score: 0, total: 0 }
        }
      }
    }
  }

  // Compare Pokemon (enhanced)
  const comparePokemon = (pokemon1, pokemon2) => {
    if (!pokemon1 || !pokemon2) return null
    
    try {
      const perf1 = calculatePVPPerformance(pokemon1)
      const perf2 = calculatePVPPerformance(pokemon2)
      
      if (!perf1 || !perf2) return null
      
      return {
        pokemon1: {
          ...pokemon1,
          performance: perf1
        },
        pokemon2: {
          ...pokemon2,
          performance: perf2
        },
        winner: perf1.overall > perf2.overall ? pokemon1 : pokemon2,
        comparison: {
          overall: {
            difference: Math.abs(perf1.overall - perf2.overall),
            winner: perf1.overall > perf2.overall ? 'pokemon1' : 'pokemon2'
          },
          byLeague: {
            great: {
              pokemon1Score: perf1.leagues.great?.score || 0,
              pokemon2Score: perf2.leagues.great?.score || 0,
              winner: (perf1.leagues.great?.score || 0) > (perf2.leagues.great?.score || 0) ? 'pokemon1' : 'pokemon2'
            },
            ultra: {
              pokemon1Score: perf1.leagues.ultra?.score || 0,
              pokemon2Score: perf2.leagues.ultra?.score || 0,
              winner: (perf1.leagues.ultra?.score || 0) > (perf2.leagues.ultra?.score || 0) ? 'pokemon1' : 'pokemon2'
            },
            master: {
              pokemon1Score: perf1.leagues.master?.score || 0,
              pokemon2Score: perf2.leagues.master?.score || 0,
              winner: (perf1.leagues.master?.score || 0) > (perf2.leagues.master?.score || 0) ? 'pokemon1' : 'pokemon2'
            }
          }
        }
      }
      
    } catch (error) {
      console.error('Error comparing Pokemon:', error)
      return null
    }
  }

  // Get comprehensive stats about the database
  const getDatabaseStats = () => {
    if (!database) return {
      totalPokemon: 0,
      totalMoves: 0,
      totalLeagues: 0,
      availableLeagues: [],
      totalRaids: 0,
      lastUpdated: null,
      metadata: null
    }
    
    const availableLeagues = Object.keys(database.rankings?.leagues || {})
    const totalPokemon = Object.keys(database.pokemon || {}).length
    const totalMoves = Object.keys(database.moves || {}).length
    
    return {
      totalPokemon,
      totalMoves,
      totalLeagues: availableLeagues.length,
      availableLeagues,
      totalRaids: 0, // TODO: Calculate from raid bosses data
      lastUpdated: lastUpdated,
      metadata: database.metadata || null
    }
  }

  // Get move data
  const getMoveData = (moveId) => {
    if (!database || !moveId) return null
    return database.moves[moveId] || null
  }

  // Get all moves
  const getAllMoves = () => {
    if (!database) return []
    return Object.values(database.moves)
  }

  const value = {
    // Main data
    data,
    database,
    loading,
    error,
    lastUpdated,
    
    // For PokemonAnalysisTable compatibility
    allPokemon: getAllPokemon(),
    rankings: database?.rankings || {},
    allMoves: getAllMoves(),
    isLoading: loading,
    
    // Legacy compatibility properties
    retryCount: 0,
    dataStatus: {
      gamemaster: 'success',
      greatLeague: 'success', 
      ultraLeague: 'success',
      masterLeague: 'success'
    },
    retry: refreshData,
    clearCache: () => pvpokeService.clearCache(),
    
    // Functions
    refreshData,
    searchPokemon,
    getPokemonByLeague,
    getTopPerformers,
    
    // Legacy compatibility functions
    getAllPokemon,
    getPokemonById,
    getLeagueRankings,
    calculatePVPPerformance,
    comparePokemon,
    
    // For ComparisonPage compatibility
    getPokemonData: (pokemonName) => {
      if (!data) return { pvp: {}, raid: null }
      
      // Find Pokemon in rankings data
      const result = { pvp: {}, raid: null }
      
      if (data.pvp) {
        Object.entries(data.pvp).forEach(([league, rankings]) => {
          const found = rankings.find(p => 
            p.Pokemon?.toLowerCase() === pokemonName.toLowerCase() ||
            p.speciesId?.toLowerCase() === pokemonName.toLowerCase()
          )
          if (found) {
            result.pvp[league] = found
          }
        })
      }
      
      return result
    },
    
    // New database functions
    getDatabaseStats,
    getDataSummary: getDatabaseStats, // Alias for backward compatibility
    getMoveData,
    getAllMoves,
    
    // Service reference for advanced usage
    pvpokeService
  }

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  )
}

export default DataProvider 