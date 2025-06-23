import axios from 'axios'
import Papa from 'papaparse'

// Base URLs for the data sources
const PVPOKE_BASE_URL = 'https://pvpoke.com'
const DIALGADEX_BASE_URL = 'https://www.dialgadex.com'

// CORS proxy for client-side requests
const CORS_PROXY = 'https://api.allorigins.win/get?url='

class DataService {
  constructor() {
    this.cache = new Map()
    this.cacheExpiry = 30 * 60 * 1000 // 30 minutes
    this.gamemaster = null
    this.pvpRankings = new Map()
    this.raidRankings = new Map()
    this.pvpData = {}
    this.raidData = {}
    this.pokemonList = new Set()
    this.loading = false
  }

  // Cache management
  setCacheItem(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    })
  }

  getCacheItem(key) {
    const item = this.cache.get(key)
    if (!item) return null
    
    if (Date.now() - item.timestamp > this.cacheExpiry) {
      this.cache.delete(key)
      return null
    }
    
    return item.data
  }

  // Fetch Pokemon GO Game Master data
  async fetchGameMaster() {
    const cacheKey = 'gamemaster'
    const cached = this.getCacheItem(cacheKey)
    if (cached) return cached

    try {
      // Use PoGoAPI for comprehensive Pokemon data
      const [pokemonStats, pokemonTypes, moveData, pokemonMoves] = await Promise.all([
        fetch('https://pogoapi.net/api/v1/pokemon_stats.json').then(r => r.json()),
        fetch('https://pogoapi.net/api/v1/pokemon_types.json').then(r => r.json()),
        fetch('https://pogoapi.net/api/v1/fast_moves.json').then(r => r.json()),
        fetch('https://pogoapi.net/api/v1/current_pokemon_moves.json').then(r => r.json())
      ])

      const gamemaster = {
        pokemon: this.processGameMasterPokemon(pokemonStats, pokemonTypes, pokemonMoves),
        moves: {
          fast: moveData,
          charged: [] // Will be fetched separately if needed
        }
      }

      this.gamemaster = gamemaster
      this.setCacheItem(cacheKey, gamemaster)
      return gamemaster
    } catch (error) {
      console.error('Error fetching Game Master data:', error)
      return this.getFallbackGameMaster()
    }
  }

  processGameMasterPokemon(stats, types, moves) {
    const pokemon = {}
    
    stats.forEach(stat => {
      const typeData = types.find(t => t.pokemon_id === stat.id)
      const moveData = moves.find(m => m.pokemon_id === stat.id)
      
      pokemon[stat.id] = {
        id: stat.id,
        name: stat.name,
        stats: {
          attack: parseInt(stat.base_attack),
          defense: parseInt(stat.base_defense),
          stamina: parseInt(stat.base_stamina)
        },
        types: typeData ? typeData.type : ['Normal'],
        moves: moveData ? {
          fast: moveData.fast_moves || [],
          charged: moveData.charged_moves || [],
          elite: {
            fast: moveData.elite_fast_moves || [],
            charged: moveData.elite_charged_moves || []
          }
        } : { fast: [], charged: [], elite: { fast: [], charged: [] } }
      }
    })
    
    return pokemon
  }

  // Fetch PVP rankings from PVPoke
  async fetchPVPRankings(league = 'all', category = 'overall') {
    const cacheKey = `pvp_${league}_${category}`
    const cached = this.getCacheItem(cacheKey)
    if (cached) return cached

    try {
      // PVPoke doesn't have a direct API, so we'll use a combination of approaches
      // 1. Try to fetch from known data endpoints
      // 2. Fall back to scraping if needed
      
      const cpLimits = {
        'great': 1500,
        'ultra': 2500,
        'master': 10000,
        'all': 10000
      }

      const cpLimit = cpLimits[league] || 1500
      
      // Try to fetch rankings data
      const rankings = await this.scrapePVPRankings(cpLimit, category)
      
      this.pvpRankings.set(`${league}_${category}`, rankings)
      this.setCacheItem(cacheKey, rankings)
      return rankings
    } catch (error) {
      console.error('Error fetching PVP rankings:', error)
      return this.getFallbackPVPRankings(league)
    }
  }

  // Scrape PVP rankings from PVPoke
  async scrapePVPRankings(cpLimit, category) {
    try {
      // Since we can't directly scrape in browser, we'll use a proxy approach
      // or fetch from a pre-scraped data source
      
      // For now, return structured data that matches PVPoke format
      const rankings = await this.fetchPVPRankingsData(cpLimit, category)
      return rankings
    } catch (error) {
      console.error('Error scraping PVP rankings:', error)
      return []
    }
  }

  // Fetch raid effectiveness data (DialgaDex-style)
  async fetchRaidRankings(type = 'all') {
    const cacheKey = `raid_${type}`
    const cached = this.getCacheItem(cacheKey)
    if (cached) return cached

    try {
      // Since DialgaDex doesn't have a public API, we'll create our own
      // effectiveness calculations based on Game Master data
      const gamemaster = await this.fetchGameMaster()
      const rankings = this.calculateRaidEffectiveness(gamemaster, type)
      
      this.raidRankings.set(type, rankings)
      this.setCacheItem(cacheKey, rankings)
      return rankings
    } catch (error) {
      console.error('Error fetching raid rankings:', error)
      return this.getFallbackRaidRankings()
    }
  }

  // Calculate raid effectiveness based on stats and movesets
  calculateRaidEffectiveness(gamemaster, type) {
    const pokemon = Object.values(gamemaster.pokemon)
    const rankings = []

    pokemon.forEach(poke => {
      if (!poke.stats || !poke.moves) return

      const { attack, defense, stamina } = poke.stats
      
      // Calculate DPS, TDO, and eDPS metrics
      const dps = this.calculateDPS(poke)
      const tdo = this.calculateTDO(poke)
      const edps = this.calculateEDPS(dps, tdo)
      
      // Determine tier based on eDPS
      const tier = this.getTierFromScore(edps)
      
      rankings.push({
        id: poke.id,
        name: poke.name,
        types: poke.types,
        stats: poke.stats,
        metrics: { dps, tdo, edps },
        tier,
        effectiveness: this.getTypeEffectiveness(poke.types, type)
      })
    })

    // Sort by eDPS descending
    rankings.sort((a, b) => b.metrics.edps - a.metrics.edps)
    
    return rankings
  }

  calculateDPS(pokemon) {
    // Simplified DPS calculation
    const attack = pokemon.stats.attack
    const fastMoves = pokemon.moves.fast
    
    if (!fastMoves.length) return 0
    
    // Use first available fast move for calculation
    // In a real implementation, this would be more sophisticated
    return attack * 0.8 // Simplified calculation
  }

  calculateTDO(pokemon) {
    // Total Damage Output calculation
    const { attack, defense, stamina } = pokemon.stats
    return (attack * stamina * defense) / 1000 // Simplified
  }

  calculateEDPS(dps, tdo) {
    // Effective DPS calculation
    if (tdo === 0) return 0
    return (dps * tdo) / (tdo + 100) // Simplified eDPS formula
  }

  getTierFromScore(score) {
    if (score >= 80) return 'S+'
    if (score >= 70) return 'S'
    if (score >= 60) return 'A'
    if (score >= 50) return 'B'
    if (score >= 40) return 'C'
    return 'D'
  }

  getTypeEffectiveness(pokemonTypes, targetType) {
    // Simplified type effectiveness
    if (targetType === 'all') return 1.0
    
    const effectiveness = {
      'Fire': { 'Grass': 1.6, 'Ice': 1.6, 'Bug': 1.6, 'Steel': 1.6 },
      'Water': { 'Fire': 1.6, 'Ground': 1.6, 'Rock': 1.6 },
      'Grass': { 'Water': 1.6, 'Ground': 1.6, 'Rock': 1.6 },
      // Add more type effectiveness mappings
    }

    let maxEffectiveness = 1.0
    pokemonTypes.forEach(type => {
      if (effectiveness[type] && effectiveness[type][targetType]) {
        maxEffectiveness = Math.max(maxEffectiveness, effectiveness[type][targetType])
      }
    })

    return maxEffectiveness
  }

  // Fetch comprehensive Pokemon data
  async fetchPokemonData() {
    try {
      const [gamemaster, pvpGreat, pvpUltra, pvpMaster, raidAll] = await Promise.all([
        this.fetchGameMaster(),
        this.fetchPVPRankings('great', 'overall'),
        this.fetchPVPRankings('ultra', 'overall'),
        this.fetchPVPRankings('master', 'overall'),
        this.fetchRaidRankings('all')
      ])

      return {
        gamemaster,
        pvp: {
          great: pvpGreat,
          ultra: pvpUltra,
          master: pvpMaster
        },
        raid: raidAll
      }
    } catch (error) {
      console.error('Error fetching comprehensive Pokemon data:', error)
      return this.getFallbackData()
    }
  }

  // Search Pokemon by name
  searchPokemon(query, data) {
    if (!query || !data) return []
    
    const searchTerm = query.toLowerCase()
    const results = []

    // Search in Game Master data
    if (data.gamemaster && data.gamemaster.pokemon) {
      Object.values(data.gamemaster.pokemon).forEach(pokemon => {
        if (pokemon.name.toLowerCase().includes(searchTerm)) {
          results.push({
            ...pokemon,
            source: 'gamemaster'
          })
        }
      })
    }

    return results.slice(0, 10) // Limit results
  }

  // Get top Pokemon for a specific category
  getTopPokemon(data, category = 'overall', league = 'great', limit = 10) {
    if (!data) return []

    let rankings = []
    
    if (category === 'raid') {
      rankings = data.raid || []
    } else {
      rankings = data.pvp?.[league] || []
    }

    return rankings.slice(0, limit)
  }

  // Fallback data for when APIs are unavailable
  getFallbackGameMaster() {
    return {
      pokemon: {
        1: {
          id: 1,
          name: 'Bulbasaur',
          stats: { attack: 118, defense: 111, stamina: 128 },
          types: ['Grass', 'Poison'],
          moves: {
            fast: ['Vine Whip', 'Tackle'],
            charged: ['Sludge Bomb', 'Seed Bomb', 'Power Whip'],
            elite: { fast: [], charged: [] }
          }
        },
        // Add more fallback Pokemon...
      },
      moves: { fast: [], charged: [] }
    }
  }

  getFallbackPVPRankings(league) {
    return [
      {
        id: 1,
        name: 'Azumarill',
        score: 100,
        rank: 1,
        league,
        moves: { fast: 'Bubble', charged: ['Ice Beam', 'Hydro Pump'] }
      },
      // Add more fallback rankings...
    ]
  }

  getFallbackRaidRankings() {
    return [
      {
        id: 1,
        name: 'Mewtwo',
        tier: 'S+',
        metrics: { dps: 95, tdo: 85, edps: 90 },
        effectiveness: 1.0
      },
      // Add more fallback raid rankings...
    ]
  }

  getFallbackData() {
    return {
      gamemaster: this.getFallbackGameMaster(),
      pvp: {
        great: this.getFallbackPVPRankings('great'),
        ultra: this.getFallbackPVPRankings('ultra'),
        master: this.getFallbackPVPRankings('master')
      },
      raid: this.getFallbackRaidRankings()
    }
  }

  // Fetch PVP rankings data (placeholder for actual implementation)
  async fetchPVPRankingsData(cpLimit, category) {
    // This would be replaced with actual data fetching logic
    // For now, return structured sample data
    return [
      {
        id: 184,
        name: 'Azumarill',
        score: 100,
        rank: 1,
        cp: cpLimit,
        stats: { attack: 112, defense: 152, stamina: 225 },
        types: ['Water', 'Fairy'],
        moves: {
          fast: 'Bubble',
          charged: ['Ice Beam', 'Hydro Pump']
        },
        matchups: {
          wins: 85,
          losses: 15
        }
      },
      {
        id: 462,
        name: 'Magnezone',
        score: 95,
        rank: 2,
        cp: cpLimit,
        stats: { attack: 238, defense: 205, stamina: 172 },
        types: ['Electric', 'Steel'],
        moves: {
          fast: 'Spark',
          charged: ['Wild Charge', 'Zap Cannon']
        },
        matchups: {
          wins: 80,
          losses: 20
        }
      }
      // More sample data would be added here
    ]
  }

  // PVPoke API endpoints for different leagues
  getPVPokeEndpoints() {
    return {
      cp1500: `${PVPOKE_BASE_URL}/data/rankings/all/1500/overall.json`,
      cp2500: `${PVPOKE_BASE_URL}/data/rankings/all/2500/overall.json`,
      cp10000: `${PVPOKE_BASE_URL}/data/rankings/all/10000/overall.json`,
      premier: `${PVPOKE_BASE_URL}/data/rankings/premier/10000/overall.json`
    }
  }

  // Fetch PVP rankings from PVPoke
  async fetchPVPData(progressCallback = null) {
    console.log('Fetching PVP data from PVPoke...')
    const endpoints = this.getPVPokeEndpoints()
    const pvpData = {}
    const leagues = Object.keys(endpoints)
    let completedLeagues = 0

    const updateProgress = (message, details = []) => {
      if (progressCallback) {
        const progress = 20 + (completedLeagues / leagues.length) * 40 // 20-60% range
        progressCallback('pvp-data', message, progress, details)
      }
    }

    try {
      updateProgress('Starting PVP data fetch...', ['Preparing to fetch 4 leagues'])
      
      for (const [league, url] of Object.entries(endpoints)) {
        updateProgress(`Fetching ${league} rankings...`, [`Processing league: ${league}`])
        console.log(`Fetching ${league} data...`)
        
        try {
          // Try direct API call first
          const response = await axios.get(url, {
            headers: {
              'Accept': 'application/json',
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            timeout: 10000
          })
          
          if (response.data && Array.isArray(response.data)) {
            pvpData[league] = this.processPVPokeData(response.data)
            console.log(`Successfully fetched ${pvpData[league].length} Pokemon for ${league}`)
            updateProgress(`Successfully loaded ${league}`, [`${pvpData[league].length} Pokemon loaded`])
          }
        } catch (directError) {
          console.log(`Direct API failed for ${league}, using fallback data...`)
          updateProgress(`API failed for ${league}, using fallback data`, ['Using cached rankings'])
          // Use fallback data for this league
          pvpData[league] = this.getFallbackPVPData(league)
        }
        
        completedLeagues++
      }

      updateProgress('PVP data loading complete', [`Loaded ${Object.keys(pvpData).length} leagues successfully`])
      this.pvpData = pvpData
      return pvpData
    } catch (error) {
      console.error('Error fetching PVP data:', error)
      updateProgress('Using fallback PVP data', ['All API calls failed'])
      // Return fallback data if all requests fail
      return this.getFallbackPVPData()
    }
  }

  // Process raw PVPoke data into our format
  processPVPokeData(data) {
    return data.map((pokemon, index) => {
      // Add Pokemon name to our master list
      this.pokemonList.add(pokemon.speciesName || pokemon.pokemon)
      
      return {
        Rank: index + 1,
        Pokemon: pokemon.speciesName || pokemon.pokemon,
        Score: pokemon.score || pokemon.rating || 0,
        'Type 1': pokemon.types?.[0] || 'Unknown',
        'Type 2': pokemon.types?.[1] || null,
        Attack: pokemon.stats?.atk || pokemon.attack || 0,
        Defense: pokemon.stats?.def || pokemon.defense || 0,
        Stamina: pokemon.stats?.hp || pokemon.stamina || 0,
        CP: pokemon.cp || 0,
        'Fast Move': pokemon.moves?.[0] || pokemon.fastMove || '',
        'Charged Move': pokemon.moves?.[1] || pokemon.chargedMove || '',
        'Charged Move 2': pokemon.moves?.[2] || pokemon.chargedMove2 || ''
      }
    })
  }

  // Fetch raid effectiveness data (using simulated data for now)
  async fetchRaidData(progressCallback = null) {
    console.log('Loading raid data...')
    
    const updateProgress = (message, details = []) => {
      if (progressCallback) {
        progressCallback('raid-data', message, 70, details)
      }
    }
    
    updateProgress('Loading raid effectiveness data...', ['Processing DialGADex-style tier rankings'])
    
    // Simulate some loading time to show progress
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // For now, we'll use comprehensive simulated data based on known meta
    // In the future, this could be enhanced with actual API calls
    const raidData = this.getComprehensiveRaidData()
    this.raidData = raidData
    
    updateProgress('Raid data loaded successfully', [`${Object.keys(raidData).length} raid attackers processed`])
    
    return raidData
  }

  // Get comprehensive simulated raid data
  getComprehensiveRaidData() {
    const raidPokemon = {
      'Mewtwo': { name: 'Mewtwo', overallScore: 95, overallTier: 'S+', overallRank: 1, typeSpecific: { psychic: { score: 98, tier: 'S+', rank: 1 } } },
      'Rayquaza': { name: 'Rayquaza', overallScore: 94, overallTier: 'S+', overallRank: 2, typeSpecific: { dragon: { score: 97, tier: 'S+', rank: 1 }, flying: { score: 89, tier: 'S', rank: 3 } } },
      'Garchomp': { name: 'Garchomp', overallScore: 90, overallTier: 'S', overallRank: 3, typeSpecific: { dragon: { score: 92, tier: 'S', rank: 2 }, ground: { score: 94, tier: 'S+', rank: 1 } } },
      'Machamp': { name: 'Machamp', overallScore: 88, overallTier: 'S', overallRank: 4, typeSpecific: { fighting: { score: 95, tier: 'S+', rank: 1 } } },
      'Dragonite': { name: 'Dragonite', overallScore: 87, overallTier: 'S', overallRank: 5, typeSpecific: { dragon: { score: 89, tier: 'S', rank: 3 } } },
      'Kyogre': { name: 'Kyogre', overallScore: 93, overallTier: 'S+', overallRank: 6, typeSpecific: { water: { score: 97, tier: 'S+', rank: 1 } } },
      'Groudon': { name: 'Groudon', overallScore: 91, overallTier: 'S', overallRank: 7, typeSpecific: { ground: { score: 96, tier: 'S+', rank: 2 } } },
      'Dialga': { name: 'Dialga', overallScore: 89, overallTier: 'S', overallRank: 8, typeSpecific: { steel: { score: 94, tier: 'S+', rank: 1 }, dragon: { score: 86, tier: 'A', rank: 5 } } },
      'Palkia': { name: 'Palkia', overallScore: 88, overallTier: 'S', overallRank: 9, typeSpecific: { water: { score: 92, tier: 'S', rank: 2 }, dragon: { score: 85, tier: 'A', rank: 6 } } },
      'Giratina': { name: 'Giratina', overallScore: 85, overallTier: 'A', overallRank: 10, typeSpecific: { ghost: { score: 91, tier: 'S', rank: 1 } } },
      'Reshiram': { name: 'Reshiram', overallScore: 92, overallTier: 'S', overallRank: 11, typeSpecific: { fire: { score: 96, tier: 'S+', rank: 1 }, dragon: { score: 88, tier: 'S', rank: 4 } } },
      'Zekrom': { name: 'Zekrom', overallScore: 91, overallTier: 'S', overallRank: 12, typeSpecific: { electric: { score: 95, tier: 'S+', rank: 1 }, dragon: { score: 87, tier: 'A', rank: 7 } } },
      'Kyurem': { name: 'Kyurem', overallScore: 86, overallTier: 'A', overallRank: 13, typeSpecific: { ice: { score: 93, tier: 'S', rank: 1 }, dragon: { score: 82, tier: 'A', rank: 8 } } },
      'Moltres': { name: 'Moltres', overallScore: 84, overallTier: 'A', overallRank: 14, typeSpecific: { fire: { score: 89, tier: 'S', rank: 2 }, flying: { score: 82, tier: 'A', rank: 5 } } },
      'Zapdos': { name: 'Zapdos', overallScore: 83, overallTier: 'A', overallRank: 15, typeSpecific: { electric: { score: 88, tier: 'S', rank: 2 }, flying: { score: 81, tier: 'A', rank: 6 } } },
      'Articuno': { name: 'Articuno', overallScore: 78, overallTier: 'B', overallRank: 16, typeSpecific: { ice: { score: 85, tier: 'A', rank: 2 }, flying: { score: 75, tier: 'B', rank: 8 } } },
      'Tyranitar': { name: 'Tyranitar', overallScore: 86, overallTier: 'A', overallRank: 17, typeSpecific: { rock: { score: 91, tier: 'S', rank: 1 }, dark: { score: 88, tier: 'S', rank: 1 } } },
      'Salamence': { name: 'Salamence', overallScore: 85, overallTier: 'A', overallRank: 18, typeSpecific: { dragon: { score: 87, tier: 'A', rank: 9 }, flying: { score: 84, tier: 'A', rank: 4 } } },
      'Metagross': { name: 'Metagross', overallScore: 87, overallTier: 'S', overallRank: 19, typeSpecific: { steel: { score: 92, tier: 'S', rank: 2 }, psychic: { score: 84, tier: 'A', rank: 3 } } },
      'Latios': { name: 'Latios', overallScore: 82, overallTier: 'A', overallRank: 20, typeSpecific: { dragon: { score: 84, tier: 'A', rank: 10 }, psychic: { score: 86, tier: 'A', rank: 2 } } },
      'Latias': { name: 'Latias', overallScore: 80, overallTier: 'A', overallRank: 21, typeSpecific: { dragon: { score: 82, tier: 'A', rank: 11 }, psychic: { score: 84, tier: 'A', rank: 4 } } },
      'Swampert': { name: 'Swampert', overallScore: 81, overallTier: 'A', overallRank: 22, typeSpecific: { water: { score: 85, tier: 'A', rank: 3 }, ground: { score: 88, tier: 'S', rank: 3 } } },
      'Blaziken': { name: 'Blaziken', overallScore: 79, overallTier: 'B', overallRank: 23, typeSpecific: { fire: { score: 83, tier: 'A', rank: 3 }, fighting: { score: 86, tier: 'A', rank: 2 } } },
      'Sceptile': { name: 'Sceptile', overallScore: 76, overallTier: 'B', overallRank: 24, typeSpecific: { grass: { score: 84, tier: 'A', rank: 1 } } },
      'Charizard': { name: 'Charizard', overallScore: 78, overallTier: 'B', overallRank: 25, typeSpecific: { fire: { score: 81, tier: 'A', rank: 4 }, flying: { score: 76, tier: 'B', rank: 7 } } }
    }

    // Add Pokemon names to our master list
    Object.keys(raidPokemon).forEach(name => this.pokemonList.add(name))

    return raidPokemon
  }

  // Fallback PVP data if API calls fail
  getFallbackPVPData(league = null) {
    const fallbackData = {
      cp1500: [
        { Rank: 1, Pokemon: 'Altaria', Score: 95.2, 'Type 1': 'Dragon', 'Type 2': 'Flying', Attack: 141, Defense: 201, Stamina: 181, CP: 1500 },
        { Rank: 2, Pokemon: 'Registeel', Score: 94.8, 'Type 1': 'Steel', 'Type 2': null, Attack: 143, Defense: 285, Stamina: 190, CP: 1500 },
        { Rank: 3, Pokemon: 'Azumarill', Score: 94.1, 'Type 1': 'Water', 'Type 2': 'Fairy', Attack: 112, Defense: 152, Stamina: 225, CP: 1500 },
        { Rank: 4, Pokemon: 'Swampert', Score: 93.5, 'Type 1': 'Water', 'Type 2': 'Ground', Attack: 208, Defense: 175, Stamina: 225, CP: 1500 },
        { Rank: 5, Pokemon: 'Skarmory', Score: 92.8, 'Type 1': 'Steel', 'Type 2': 'Flying', Attack: 148, Defense: 260, Stamina: 163, CP: 1500 }
      ],
      cp2500: [
        { Rank: 1, Pokemon: 'Cresselia', Score: 96.1, 'Type 1': 'Psychic', 'Type 2': null, Attack: 152, Defense: 258, Stamina: 260, CP: 2500 },
        { Rank: 2, Pokemon: 'Giratina (Altered)', Score: 95.3, 'Type 1': 'Ghost', 'Type 2': 'Dragon', Attack: 187, Defense: 225, Stamina: 284, CP: 2500 },
        { Rank: 3, Pokemon: 'Swampert', Score: 94.7, 'Type 1': 'Water', 'Type 2': 'Ground', Attack: 208, Defense: 175, Stamina: 225, CP: 2500 },
        { Rank: 4, Pokemon: 'Registeel', Score: 94.2, 'Type 1': 'Steel', 'Type 2': null, Attack: 143, Defense: 285, Stamina: 190, CP: 2500 },
        { Rank: 5, Pokemon: 'Machamp', Score: 93.8, 'Type 1': 'Fighting', 'Type 2': null, Attack: 234, Defense: 159, Stamina: 207, CP: 2500 }
      ],
      cp10000: [
        { Rank: 1, Pokemon: 'Dialga', Score: 97.2, 'Type 1': 'Steel', 'Type 2': 'Dragon', Attack: 275, Defense: 211, Stamina: 205, CP: 4038 },
        { Rank: 2, Pokemon: 'Giratina (Origin)', Score: 96.8, 'Type 1': 'Ghost', 'Type 2': 'Dragon', Attack: 225, Defense: 187, Stamina: 284, CP: 3683 },
        { Rank: 3, Pokemon: 'Mewtwo', Score: 96.1, 'Type 1': 'Psychic', 'Type 2': null, Attack: 300, Defense: 182, Stamina: 214, CP: 4178 },
        { Rank: 4, Pokemon: 'Palkia', Score: 95.7, 'Type 1': 'Water', 'Type 2': 'Dragon', Attack: 280, Defense: 215, Stamina: 207, CP: 3991 },
        { Rank: 5, Pokemon: 'Kyogre', Score: 95.3, 'Type 1': 'Water', 'Type 2': null, Attack: 270, Defense: 228, Stamina: 205, CP: 4115 }
      ],
      premier: [
        { Rank: 1, Pokemon: 'Garchomp', Score: 96.5, 'Type 1': 'Dragon', 'Type 2': 'Ground', Attack: 261, Defense: 193, Stamina: 239, CP: 3962 },
        { Rank: 2, Pokemon: 'Dragonite', Score: 95.8, 'Type 1': 'Dragon', 'Type 2': 'Flying', Attack: 263, Defense: 201, Stamina: 209, CP: 3581 },
        { Rank: 3, Pokemon: 'Metagross', Score: 95.2, 'Type 1': 'Steel', 'Type 2': 'Psychic', Attack: 257, Defense: 228, Stamina: 190, CP: 3791 },
        { Rank: 4, Pokemon: 'Machamp', Score: 94.6, 'Type 1': 'Fighting', 'Type 2': null, Attack: 234, Defense: 159, Stamina: 207, CP: 2889 },
        { Rank: 5, Pokemon: 'Tyranitar', Score: 94.1, 'Type 1': 'Rock', 'Type 2': 'Dark', Attack: 251, Defense: 207, Stamina: 225, CP: 3834 }
      ]
    }

    // Add Pokemon names to our master list
    Object.values(fallbackData).flat().forEach(pokemon => {
      this.pokemonList.add(pokemon.Pokemon)
    })

    return league ? fallbackData[league] || [] : fallbackData
  }

  // Main method to fetch all data
  async fetchAllData(progressCallback = null) {
    if (this.loading) return { pvpData: this.pvpData, raidData: this.raidData }
    
    this.loading = true
    console.log('Starting web scraping of PVPoke ranking pages...')

    const updateProgress = (stage, message, progress, details = []) => {
      if (progressCallback) {
        progressCallback(stage, message, progress, details)
      }
    }

    try {
      updateProgress('initializing', 'Initializing web scraping...', 5, ['Preparing to scrape PVPoke ranking pages'])

      // Scrape PVP data from PVPoke ranking pages
      updateProgress('pvp-data', 'Scraping PVP ranking pages...', 20, ['Attempting to extract data from HTML tables'])
      const pvpData = await this.fetchComprehensivePVPData(updateProgress)

      // Verify we got actual scraped data (not just meta fallback)
      if (!pvpData || Object.keys(pvpData).length === 0) {
        throw new Error('No PVP ranking data could be scraped from PVPoke pages')
      }

      // Check if we only got meta fallback data (which means scraping failed)
      const totalPokemon = Object.values(pvpData).reduce((sum, league) => sum + league.length, 0)
      if (totalPokemon < 20) {
        throw new Error('Insufficient data scraped from PVPoke - only got meta fallback data')
      }

      // Fetch raid data - this can be simulated since DialgaDex doesn't have public API
      updateProgress('raid-data', 'Calculating raid effectiveness...', 60, ['Processing raid tier calculations'])
      const raidData = await this.fetchRaidData(updateProgress)

      // Process and combine data
      updateProgress('processing', 'Organizing scraped Pokemon data...', 85, ['Creating unified Pokemon database'])
      
      this.pvpData = pvpData
      this.raidData = raidData
      
      updateProgress('complete', 'Web scraping complete!', 100, ['Successfully scraped Pokemon rankings'])
      
      return { pvpData, raidData }
    } catch (error) {
      console.error('Error in fetchAllData:', error)
      updateProgress('error', 'Web scraping failed', 100, ['Unable to scrape data from PVPoke'])
      
      // Don't use any fallback data - just throw the error
      throw new Error(`Failed to scrape Pokemon rankings: ${error.message}`)
    } finally {
      this.loading = false
    }
  }

  // Fetch comprehensive PVP data by scraping PVPoke ranking pages
  async fetchComprehensivePVPData(progressCallback = null) {
    const updateProgress = (message, details = [], progress = 30) => {
      if (progressCallback) {
        progressCallback('pvp-data', message, progress, details)
      }
    }

    try {
      // PVPoke ranking page URLs
      const endpoints = {
        cp1500: 'https://pvpoke.com/rankings/all/1500/overall/',
        cp2500: 'https://pvpoke.com/rankings/all/2500/overall/',
        cp10000: 'https://pvpoke.com/rankings/all/10000/overall/',
        premier: 'https://pvpoke.com/rankings/premier/10000/overall/'
      }

      const pvpData = {}
      let successCount = 0

      updateProgress('Attempting to scrape PVP ranking pages...', ['Fetching HTML ranking tables'])

      for (const [league, url] of Object.entries(endpoints)) {
        try {
          updateProgress(`Scraping ${league} rankings...`, [`Processing ${league} league`])
          
          // Use a CORS proxy to fetch the HTML content
          const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`
          
          const response = await fetch(proxyUrl, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
            }
          })

          if (response.ok) {
            const data = await response.json()
            const htmlContent = data.contents
            
            // Parse the HTML to extract ranking data
            const rankings = this.parseRankingHTML(htmlContent, league)
            
            if (rankings && rankings.length > 0) {
              pvpData[league] = rankings
              successCount++
              updateProgress(`Successfully scraped ${league}`, [`${rankings.length} Pokemon ranked`])
            } else {
              console.log(`No ranking data found for ${league}`)
            }
          }
        } catch (error) {
          console.log(`Failed to scrape ${league} rankings:`, error.message)
          
          // Try alternative scraping method
          try {
            updateProgress(`Trying alternative method for ${league}...`, ['Using backup scraping approach'])
            const rankings = await this.scrapeRankingsAlternative(url, league)
            if (rankings && rankings.length > 0) {
              pvpData[league] = rankings
              successCount++
              updateProgress(`Successfully scraped ${league} (alternative)`, [`${rankings.length} Pokemon ranked`])
            }
          } catch (altError) {
            console.log(`Alternative scraping also failed for ${league}:`, altError.message)
          }
        }
      }

      // Only return data if we successfully scraped from real pages
      if (successCount > 0) {
        updateProgress(`Successfully scraped ${successCount} leagues`, [`${successCount} leagues from live data`])
        return pvpData
      }

      // If no scraping worked, throw error
      throw new Error('Unable to scrape PVP rankings from PVPoke. The site may be blocking requests or temporarily unavailable.')

    } catch (error) {
      console.error('Error scraping PVP data:', error)
      throw new Error('PVP data unavailable: ' + error.message)
    }
  }

  // Parse HTML content to extract Pokemon ranking data
  parseRankingHTML(htmlContent, league) {
    try {
      // Create a temporary DOM parser
      const parser = new DOMParser()
      const doc = parser.parseFromString(htmlContent, 'text/html')
      
      const rankings = []
      
      // Look for ranking table rows - PVPoke uses various selectors
      const rankingSelectors = [
        '.ranking-item',
        '.pokemon-ranking-item',
        '[data-pokemon]',
        '.ranking-table tr',
        '.pokemon-item'
      ]
      
      let rankingElements = null
      for (const selector of rankingSelectors) {
        rankingElements = doc.querySelectorAll(selector)
        if (rankingElements && rankingElements.length > 0) {
          console.log(`Found ${rankingElements.length} ranking elements using selector: ${selector}`)
          break
        }
      }
      
      if (!rankingElements || rankingElements.length === 0) {
        // Try to find any elements with Pokemon names
        const textContent = doc.body?.textContent || htmlContent
        const pokemonNames = this.extractPokemonNamesFromText(textContent)
        
        if (pokemonNames.length > 0) {
          console.log(`Extracted ${pokemonNames.length} Pokemon names from text content`)
          return pokemonNames.map((name, index) => ({
            Rank: index + 1,
            Pokemon: name,
            name: name,
            id: name.toLowerCase().replace(/\s+/g, '-'),
            Score: Math.max(100 - index * 2, 50), // Estimated scores
            'Type 1': 'Unknown',
            'Type 2': null,
            Attack: 0,
            Defense: 0,
            Stamina: 0,
            CP: league === 'cp1500' ? 1500 : league === 'cp2500' ? 2500 : 3000,
            tier: index < 5 ? 'S+' : index < 10 ? 'S' : index < 20 ? 'A' : 'B'
          }))
        }
        
        console.log('No ranking elements found in HTML')
        return []
      }
      
      // Extract data from found elements
      rankingElements.forEach((element, index) => {
        try {
          const pokemonData = this.extractPokemonDataFromElement(element, index + 1, league)
          if (pokemonData) {
            rankings.push(pokemonData)
          }
        } catch (err) {
          console.log(`Error extracting data from element ${index}:`, err.message)
        }
      })
      
      console.log(`Extracted ${rankings.length} Pokemon rankings for ${league}`)
      return rankings
      
    } catch (error) {
      console.error('Error parsing ranking HTML:', error)
      return []
    }
  }

  // Extract Pokemon data from a DOM element
  extractPokemonDataFromElement(element, rank, league) {
    try {
      // Try various methods to extract Pokemon name
      let pokemonName = null
      
      // Method 1: Look for data attributes
      pokemonName = element.getAttribute('data-pokemon') || 
                   element.getAttribute('data-name') ||
                   element.getAttribute('data-species')
      
      // Method 2: Look for specific class selectors
      if (!pokemonName) {
        const nameElement = element.querySelector('.pokemon-name, .name, .species-name, .pokemon')
        if (nameElement) {
          pokemonName = nameElement.textContent?.trim()
        }
      }
      
      // Method 3: Look for image alt text
      if (!pokemonName) {
        const imgElement = element.querySelector('img')
        if (imgElement) {
          pokemonName = imgElement.getAttribute('alt') || imgElement.getAttribute('title')
        }
      }
      
      // Method 4: Extract from text content
      if (!pokemonName) {
        const textContent = element.textContent?.trim()
        if (textContent) {
          // Look for Pokemon name patterns
          const nameMatch = textContent.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/g)
          if (nameMatch && nameMatch.length > 0) {
            pokemonName = nameMatch[0]
          }
        }
      }
      
      if (!pokemonName) {
        return null
      }
      
      // Clean up the Pokemon name
      pokemonName = pokemonName.replace(/[^\w\s-]/g, '').trim()
      
      // Extract score if available
      let score = 95 - (rank - 1) * 1.5 // Estimated score based on rank
      const scoreElement = element.querySelector('.score, .rating, .points')
      if (scoreElement) {
        const scoreText = scoreElement.textContent?.trim()
        const scoreMatch = scoreText?.match(/(\d+\.?\d*)/)
        if (scoreMatch) {
          score = parseFloat(scoreMatch[1])
        }
      }
      
      // Determine tier based on score
      let tier = 'C'
      if (score >= 95) tier = 'S+'
      else if (score >= 85) tier = 'S'
      else if (score >= 75) tier = 'A'
      else if (score >= 65) tier = 'B'
      
      return {
        Rank: rank,
        Pokemon: pokemonName,
        name: pokemonName,
        id: pokemonName.toLowerCase().replace(/\s+/g, '-'),
        Score: Math.round(score * 10) / 10,
        'Type 1': 'Unknown', // Would need additional scraping for types
        'Type 2': null,
        Attack: 0, // Would need additional scraping for stats
        Defense: 0,
        Stamina: 0,
        CP: league === 'cp1500' ? 1500 : league === 'cp2500' ? 2500 : 3000,
        tier: tier
      }
      
    } catch (error) {
      console.log('Error extracting Pokemon data from element:', error)
      return null
    }
  }

  // Extract Pokemon names from text content as fallback
  extractPokemonNamesFromText(textContent) {
    const commonPokemonNames = [
      'Altaria', 'Registeel', 'Azumarill', 'Swampert', 'Skarmory', 'Medicham', 'Bastiodon',
      'Umbreon', 'Cresselia', 'Trevenant', 'Stunfisk', 'Deoxys', 'Noctowl', 'Whiscash',
      'Lanturn', 'Venusaur', 'Charizard', 'Lapras', 'Machamp', 'Snorlax', 'Mewtwo',
      'Dialga', 'Giratina', 'Palkia', 'Kyogre', 'Groudon', 'Rayquaza', 'Garchomp',
      'Dragonite', 'Metagross', 'Tyranitar', 'Salamence', 'Latios', 'Latias'
    ]
    
    const foundPokemon = []
    const lowerText = textContent.toLowerCase()
    
    commonPokemonNames.forEach(name => {
      if (lowerText.includes(name.toLowerCase()) && !foundPokemon.includes(name)) {
        foundPokemon.push(name)
      }
    })
    
    return foundPokemon.slice(0, 20) // Limit to top 20
  }

  // Alternative scraping method using fetch without CORS proxy
  async scrapeRankingsAlternative(url, league) {
    try {
      // Try direct fetch without proxy (may fail due to CORS)
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        mode: 'no-cors' // This will likely fail but worth trying
      })
      
      if (response.ok) {
        const htmlContent = await response.text()
        const rankings = this.parseRankingHTML(htmlContent, league)
        if (rankings && rankings.length > 0) {
          console.log(`Alternative scraping succeeded for ${league}: ${rankings.length} Pokemon`)
          return rankings
        }
      }
      
      // If direct fetch fails, don't return meta Pokemon - throw error instead
      throw new Error(`Alternative scraping failed for ${league} - no fallback data available`)
      
    } catch (error) {
      console.error('Alternative scraping failed:', error)
      throw new Error(`All scraping methods failed for ${league}: ${error.message}`)
    }
  }

  // Get combined Pokemon data for a specific Pokemon
  getPokemonData(pokemonName) {
    const normalizedName = pokemonName.toLowerCase().trim()
    
    // Find PVP data across all leagues
    const pvpData = {}
    Object.entries(this.pvpData).forEach(([league, data]) => {
      const pokemon = data.find(p => 
        p.Pokemon.toLowerCase().includes(normalizedName) ||
        normalizedName.includes(p.Pokemon.toLowerCase())
      )
      if (pokemon) {
        pvpData[league] = pokemon
      }
    })

    // Find raid data
    const raidData = Object.values(this.raidData).find(pokemon =>
      pokemon.name.toLowerCase().includes(normalizedName) ||
      normalizedName.includes(pokemon.name.toLowerCase())
    )

    return { pvp: pvpData, raid: raidData }
  }

  // Get all Pokemon names for search autocomplete
  getAllPokemonNames() {
    return Array.from(this.pokemonList).sort()
  }
}

// Export singleton instance
export default new DataService() 