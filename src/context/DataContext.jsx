import React, { createContext, useContext, useState, useEffect } from 'react'
import dataService from '../services/dataService'

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
  const [loading, setLoading] = useState(true)
  const [progress, setProgress] = useState(0)
  const [stage, setStage] = useState('initializing')
  const [status, setStatus] = useState('Initializing Pokemon GO data...')
  const [error, setError] = useState(null)

  const updateProgress = (newProgress, newStage, newStatus) => {
    setProgress(newProgress)
    setStage(newStage)
    setStatus(newStatus)
  }

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      updateProgress(5, 'initializing', 'Initializing Pokemon GO data...')

      // Use the improved data service
      const result = await dataService.fetchAllData((stage, message, progress, details) => {
        updateProgress(progress, stage, message)
      })

      // Check if we actually got real data (not fallback)
      if (!result.pvpData || Object.keys(result.pvpData).length === 0) {
        throw new Error('No PVP data available from external sources')
      }

      updateProgress(100, 'complete', 'Pokemon data loaded successfully!')
      
      // Structure the data properly for our context
      const combinedData = {
        pvp: result.pvpData,
        raid: result.raidData,
        gamemaster: dataService.gamemaster || {},
        lastUpdated: new Date().toISOString()
      }

      setData(combinedData)
      
      // Brief delay to show completion
      setTimeout(() => {
        setLoading(false)
      }, 500)

    } catch (error) {
      console.error('Error loading Pokemon data:', error)
      setError(error.message || 'Failed to load Pokemon data from external sources')
      
      // Do NOT load fallback data - just show error state
      setData(null)
      
      updateProgress(100, 'error', 'Failed to load data')
      setTimeout(() => {
        setLoading(false)
      }, 500)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Search Pokemon across all data sources
  const searchPokemon = (query) => {
    if (!data || !query) return []
    
    const results = []
    const searchTerm = query.toLowerCase()

    // Search in PVP data
    if (data.pvp) {
      Object.values(data.pvp).flat().forEach(pokemon => {
        if (pokemon.name?.toLowerCase().includes(searchTerm) || 
            pokemon.Pokemon?.toLowerCase().includes(searchTerm)) {
          results.push({
            ...pokemon,
            name: pokemon.name || pokemon.Pokemon,
            source: 'pvp'
          })
        }
      })
    }

    // Search in raid data
    if (data.raid) {
      Object.values(data.raid).forEach(pokemon => {
        if (pokemon.name?.toLowerCase().includes(searchTerm)) {
          results.push({
            ...pokemon,
            source: 'raid'
          })
        }
      })
    }

    // Remove duplicates and limit results
    const uniqueResults = results.filter((pokemon, index, self) => 
      index === self.findIndex(p => p.name === pokemon.name)
    )

    return uniqueResults.slice(0, 10)
  }

  // Get Pokemon details by ID or name
  const getPokemonById = (id) => {
    if (!data) return null
    
    // Search in PVP data first
    if (data.pvp) {
      for (const league of Object.values(data.pvp)) {
        const found = league.find(p => 
          p.id === id || 
          p.name === id || 
          p.Pokemon === id ||
          (p.name && p.name.toLowerCase().replace(/\s+/g, '-') === id)
        )
        if (found) return found
      }
    }

    // Search in raid data
    if (data.raid) {
      const found = Object.values(data.raid).find(p => 
        p.id === id || 
        p.name === id ||
        (p.name && p.name.toLowerCase().replace(/\s+/g, '-') === id)
      )
      if (found) return found
    }

    return null
  }

  // Get top Pokemon for a category
  const getTopPokemon = (category = 'overall', league = 'great', limit = 10) => {
    if (!data) return []

    if (category === 'raid') {
      // Return top raid Pokemon
      if (data.raid && Array.isArray(data.raid)) {
        return data.raid.slice(0, limit)
      } else if (data.raid && typeof data.raid === 'object') {
        return Object.values(data.raid)
          .sort((a, b) => (b.metrics?.edps || 0) - (a.metrics?.edps || 0))
          .slice(0, limit)
      }
      return []
    }

    // Return top PVP Pokemon for the specified league
    const leagueMap = {
      'great': 'cp1500',
      'ultra': 'cp2500', 
      'master': 'cp10000',
      'premier': 'premier'
    }

    const leagueKey = leagueMap[league] || 'cp1500'
    
    if (data.pvp && data.pvp[leagueKey]) {
      return data.pvp[leagueKey].slice(0, limit).map(pokemon => ({
        ...pokemon,
        name: pokemon.name || pokemon.Pokemon,
        id: pokemon.id || (pokemon.name || pokemon.Pokemon).toLowerCase().replace(/\s+/g, '-')
      }))
    }

    return []
  }

  // Get Pokemon rankings for a specific league
  const getPVPRankings = (league = 'great') => {
    if (!data || !data.pvp) return []
    
    const leagueMap = {
      'great': 'cp1500',
      'ultra': 'cp2500',
      'master': 'cp10000',
      'premier': 'premier'
    }

    const leagueKey = leagueMap[league] || 'cp1500'
    return data.pvp[leagueKey] || []
  }

  // Get raid rankings
  const getRaidRankings = (type = 'all') => {
    if (!data || !data.raid) return []
    
    if (Array.isArray(data.raid)) {
      return data.raid
    } else if (typeof data.raid === 'object') {
      return Object.values(data.raid)
    }
    
    return []
  }

  // Get Pokemon recommendation based on PVP and raid performance
  const getPokemonRecommendation = (pokemonId) => {
    if (!data) return null

    const pokemon = getPokemonById(pokemonId)
    if (!pokemon) return null

    // Find Pokemon in PVP rankings
    const pvpPerformance = {}
    ['great', 'ultra', 'master'].forEach(league => {
      const rankings = data.pvp[league] || []
      const found = rankings.find(p => p.id === pokemonId)
      pvpPerformance[league] = found ? {
        rank: found.rank,
        score: found.score,
        tier: found.tier || getTierFromScore(found.score)
      } : null
    })

    // Find Pokemon in raid rankings
    const raidRankings = data.raid || []
    const raidPerformance = raidRankings.find(p => p.id === pokemonId)

    // Calculate overall recommendation
    const recommendation = calculateOverallRecommendation(pvpPerformance, raidPerformance)

    return {
      pokemon,
      pvp: pvpPerformance,
      raid: raidPerformance,
      recommendation,
      investment: getInvestmentRecommendation(recommendation)
    }
  }

  // Calculate overall recommendation score
  const calculateOverallRecommendation = (pvpPerformance, raidPerformance) => {
    let totalScore = 0
    let categories = 0

    // PVP scores
    Object.values(pvpPerformance).forEach(perf => {
      if (perf && perf.score) {
        totalScore += perf.score
        categories++
      }
    })

    // Raid score
    if (raidPerformance && raidPerformance.metrics) {
      totalScore += raidPerformance.metrics.edps || 0
      categories++
    }

    const averageScore = categories > 0 ? totalScore / categories : 0
    
    return {
      score: Math.round(averageScore),
      tier: getTierFromScore(averageScore),
      categories: {
        pvp: Object.values(pvpPerformance).some(p => p !== null),
        raid: raidPerformance !== null
      }
    }
  }

  // Get investment recommendation
  const getInvestmentRecommendation = (recommendation) => {
    const score = recommendation.score
    
    if (score >= 90) {
      return {
        priority: 'high',
        stars: 5,
        message: 'Excellent investment! Top-tier in multiple formats.',
        resources: 'Worth maxing out with rare candies and stardust.'
      }
    } else if (score >= 75) {
      return {
        priority: 'medium-high',
        stars: 4,
        message: 'Great Pokemon with strong performance.',
        resources: 'Good investment for stardust and candies.'
      }
    } else if (score >= 60) {
      return {
        priority: 'medium',
        stars: 3,
        message: 'Solid performer in specific situations.',
        resources: 'Consider investing if you need this type/role.'
      }
    } else if (score >= 40) {
      return {
        priority: 'low',
        stars: 2,
        message: 'Limited use cases, budget option.',
        resources: 'Only invest if resources are abundant.'
      }
    } else {
      return {
        priority: 'very-low',
        stars: 1,
        message: 'Not recommended for competitive play.',
        resources: 'Better options available for investment.'
      }
    }
  }

  // Helper function to get tier from score
  const getTierFromScore = (score) => {
    if (score >= 90) return 'S+'
    if (score >= 80) return 'S'
    if (score >= 70) return 'A'
    if (score >= 60) return 'B'
    if (score >= 50) return 'C'
    return 'D'
  }

  // Get stats for dashboard
  const getStats = () => {
    if (!data) return null

    let totalPokemon = 0
    let pvpPokemon = 0
    let raidPokemon = 0

    // Count PVP Pokemon
    if (data.pvp) {
      const allPvpPokemon = new Set()
      Object.values(data.pvp).forEach(league => {
        if (Array.isArray(league)) {
          league.forEach(pokemon => {
            allPvpPokemon.add(pokemon.name || pokemon.Pokemon)
          })
        }
      })
      pvpPokemon = allPvpPokemon.size
      totalPokemon = Math.max(totalPokemon, pvpPokemon)
    }

    // Count raid Pokemon
    if (data.raid) {
      if (Array.isArray(data.raid)) {
        raidPokemon = data.raid.length
      } else if (typeof data.raid === 'object') {
        raidPokemon = Object.keys(data.raid).length
      }
      totalPokemon = Math.max(totalPokemon, raidPokemon)
    }

    // If we have gamemaster data, use that for total count
    if (data.gamemaster && data.gamemaster.pokemon) {
      totalPokemon = Object.keys(data.gamemaster.pokemon).length
    }

    return {
      totalPokemon,
      pvpPokemon,
      raidPokemon,
      lastUpdated: data.lastUpdated,
      offline: data.offline || false
    }
  }

  // Refresh data
  const refreshData = () => {
    loadData()
  }

  const contextValue = {
    data,
    loading,
    progress,
    stage,
    status,
    error,
    searchPokemon,
    getPokemonById,
    getTopPokemon,
    getPVPRankings,
    getRaidRankings,
    getPokemonRecommendation,
    getStats,
    refreshData
  }

  return (
    <DataContext.Provider value={contextValue}>
      {children}
    </DataContext.Provider>
  )
} 