// PVPoke Data Service - Uses local data files to avoid CORS issues
class PVPokeDataService {
  constructor() {
    // Use local data files in public directory
    this.localDataPaths = {
      gamemaster: '/data/gamemaster.json',
      rankings: {
        great: '/data/rankings/rankings-1500.json',
        ultra: '/data/rankings/rankings-2500.json', 
        master: '/data/rankings/rankings-10000.json'
      }
    };
    
    this.cache = new Map();
    this.cacheTimeout = 30 * 60 * 1000; // 30 minutes
    
    console.log('🔧 PVPokeDataService initialized with local data files');
    console.log('📁 Using local data paths:', this.localDataPaths);
    
    this.leagues = {
      great: { name: 'Great League', cp: 1500 },
      ultra: { name: 'Ultra League', cp: 2500 },
      master: { name: 'Master League', cp: 10000 }
    };
    
    this.rankingCategories = [
      'overall', 'leads', 'closers', 'switches', 'chargers', 'attackers', 'consistency'
    ];

    // Keep fallback data for extreme cases
    this.fallbackData = {
      pokemon: {
        registeel: {
          dex: 379,
          speciesId: 'registeel',
          speciesName: 'Registeel',
          baseStats: { atk: 143, def: 285, hp: 190 },
          types: ['steel'],
          fastMoves: ['Lock-On', 'Metal Claw'],
          chargedMoves: ['Flash Cannon', 'Hyper Beam', 'Focus Blast'],
          released: true
        },
        altaria: {
          dex: 334,
          speciesId: 'altaria',
          speciesName: 'Altaria',
          baseStats: { atk: 141, def: 201, hp: 181 },
          types: ['dragon', 'flying'],
          fastMoves: ['Dragon Breath', 'Peck'],
          chargedMoves: ['Dragon Pulse', 'Dazzling Gleam', 'Sky Attack'],
          released: true
        },
        skarmory: {
          dex: 227,
          speciesId: 'skarmory',
          speciesName: 'Skarmory',
          baseStats: { atk: 148, def: 260, hp: 163 },
          types: ['steel', 'flying'],
          fastMoves: ['Steel Wing', 'Air Slash'],
          chargedMoves: ['Sky Attack', 'Flash Cannon', 'Brave Bird'],
          released: true
        },
        azumarill: {
          dex: 184,
          speciesId: 'azumarill',
          speciesName: 'Azumarill',
          baseStats: { atk: 112, def: 152, hp: 225 },
          types: ['water', 'fairy'],
          fastMoves: ['Bubble', 'Rock Smash'],
          chargedMoves: ['Hydro Pump', 'Ice Beam', 'Play Rough'],
          released: true
        },
        medicham: {
          dex: 308,
          speciesId: 'medicham',
          speciesName: 'Medicham',
          baseStats: { atk: 121, def: 152, hp: 155 },
          types: ['fighting', 'psychic'],
          fastMoves: ['Counter', 'Psycho Cut'],
          chargedMoves: ['Dynamic Punch', 'Psychic', 'Ice Punch'],
          released: true
        },
        bastiodon: {
          dex: 411,
          speciesId: 'bastiodon',
          speciesName: 'Bastiodon',
          baseStats: { atk: 94, def: 286, hp: 155 },
          types: ['rock', 'steel'],
          fastMoves: ['Smack Down', 'Iron Tail'],
          chargedMoves: ['Stone Edge', 'Flamethrower', 'Flash Cannon'],
          released: true
        },
        umbreon: {
          dex: 197,
          speciesId: 'umbreon',
          speciesName: 'Umbreon',
          baseStats: { atk: 126, def: 240, hp: 216 },
          types: ['dark'],
          fastMoves: ['Snarl', 'Feint Attack'],
          chargedMoves: ['Foul Play', 'Dark Pulse', 'Last Resort'],
          released: true
        },
        swampert: {
          dex: 260,
          speciesId: 'swampert',
          speciesName: 'Swampert',
          baseStats: { atk: 208, def: 175, hp: 225 },
          types: ['water', 'ground'],
          fastMoves: ['Water Gun', 'Mud Shot'],
          chargedMoves: ['Hydro Cannon', 'Earthquake', 'Sludge Wave'],
          released: true
        }
      },
      moves: {
        'dragon-breath': {
          moveId: 'dragon-breath',
          name: 'Dragon Breath',
          type: 'dragon',
          power: 4,
          energy: 3,
          cooldown: 1000
        },
        'counter': {
          moveId: 'counter',
          name: 'Counter',
          type: 'fighting',
          power: 4,
          energy: 3,
          cooldown: 1000
        },
        'lock-on': {
          moveId: 'lock-on',
          name: 'Lock-On',
          type: 'normal',
          power: 1,
          energy: 5,
          cooldown: 1000
        }
      },
      rankings: {
        leagues: {
          great: {
            categories: {
              overall: [
                { speciesId: 'registeel', speciesName: 'Registeel', rank: 1, score: 95, cp: 1500 },
                { speciesId: 'altaria', speciesName: 'Altaria', rank: 2, score: 92, cp: 1500 },
                { speciesId: 'skarmory', speciesName: 'Skarmory', rank: 3, score: 90, cp: 1500 },
                { speciesId: 'azumarill', speciesName: 'Azumarill', rank: 4, score: 88, cp: 1500 },
                { speciesId: 'medicham', speciesName: 'Medicham', rank: 5, score: 85, cp: 1500 },
                { speciesId: 'bastiodon', speciesName: 'Bastiodon', rank: 6, score: 83, cp: 1500 },
                { speciesId: 'umbreon', speciesName: 'Umbreon', rank: 7, score: 80, cp: 1500 },
                { speciesId: 'swampert', speciesName: 'Swampert', rank: 8, score: 78, cp: 1500 }
              ]
            }
          },
          ultra: {
            categories: {
              overall: [
                { speciesId: 'registeel', speciesName: 'Registeel', rank: 1, score: 93, cp: 2500 },
                { speciesId: 'swampert', speciesName: 'Swampert', rank: 2, score: 90, cp: 2500 },
                { speciesId: 'altaria', speciesName: 'Altaria', rank: 3, score: 87, cp: 2500 },
                { speciesId: 'umbreon', speciesName: 'Umbreon', rank: 4, score: 85, cp: 2500 }
              ]
            }
          },
          master: {
            categories: {
              overall: [
                { speciesId: 'swampert', speciesName: 'Swampert', rank: 1, score: 85, cp: 4000 },
                { speciesId: 'registeel', speciesName: 'Registeel', rank: 5, score: 75, cp: 3000 }
              ]
            }
          }
        }
      },
      metadata: {
        source: 'Fallback Data',
        timestamp: new Date().toISOString(),
        note: 'Limited dataset used as fallback when local files are unavailable'
      }
    };
  }

  // Cache management
  getCacheKey(type, params = {}) {
    const paramString = Object.keys(params).length > 0 ? JSON.stringify(params) : '';
    return `${type}_${paramString}`;
  }

  setCacheItem(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  getCacheItem(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() - item.timestamp > this.cacheTimeout) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }

  // Load local file data
  async loadLocalFile(path) {
    try {
      console.log(`📁 Loading local file: ${path}`);
      const response = await fetch(path);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log(`✅ Successfully loaded ${path}`);
      return data;
    } catch (error) {
      console.error(`❌ Failed to load ${path}:`, error.message);
      throw error;
    }
  }

  // Get GameMaster data from local file
  async getGameMasterData() {
    const cacheKey = this.getCacheKey('gamemaster');
    const cached = this.getCacheItem(cacheKey);
    if (cached) {
      console.log('📦 Using cached GameMaster data');
      return cached;
    }

    try {
      console.log('🎯 Loading GameMaster data from local file...');
      const rawData = await this.loadLocalFile(this.localDataPaths.gamemaster);
      
      if (!rawData) {
        throw new Error('GameMaster data is empty');
      }

      const normalizedData = this.normalizeGameMasterData(rawData);
      this.setCacheItem(cacheKey, normalizedData);
      
      console.log('✅ Successfully loaded and normalized GameMaster data');
      console.log(`📊 GameMaster stats:`, {
        pokemon: Object.keys(normalizedData.pokemon || {}).length,
        moves: Object.keys(normalizedData.moves || {}).length
      });
      
      return normalizedData;
      
    } catch (error) {
      console.error('❌ Failed to load GameMaster data:', error);
      throw error;
    }
  }

  // Normalize GameMaster data structure
  normalizeGameMasterData(rawData) {
    const normalized = {
      pokemon: {},
      moves: {},
      metadata: {
        timestamp: rawData.timestamp || new Date().toISOString(),
        source: 'Local GameMaster File'
      }
    };

    try {
      // Process Pokemon from GameMaster
      if (rawData.pokemon) {
        Object.entries(rawData.pokemon).forEach(([key, pokemon]) => {
          const speciesId = pokemon.speciesId || key;
          normalized.pokemon[speciesId] = {
            dex: pokemon.dex || pokemon.pokemonId || 0,
            speciesId: speciesId,
            speciesName: pokemon.speciesName || pokemon.name || key,
            baseStats: {
              atk: pokemon.baseStats?.atk || pokemon.stats?.baseAttack || 100,
              def: pokemon.baseStats?.def || pokemon.stats?.baseDefense || 100,
              hp: pokemon.baseStats?.hp || pokemon.stats?.baseStamina || 100
            },
            types: pokemon.types || ['normal'],
            fastMoves: pokemon.fastMoves || pokemon.quickMoves || [],
            chargedMoves: pokemon.chargedMoves || pokemon.cinematicMoves || [],
            released: pokemon.released !== false,
            family: pokemon.family || null,
            evolutions: pokemon.evolutions || []
          };
        });
      }

      // Process Moves from GameMaster  
      if (rawData.moves) {
        Object.entries(rawData.moves).forEach(([key, move]) => {
          const moveId = move.moveId || key;
          normalized.moves[moveId] = {
            moveId: moveId,
            name: move.name || key,
            type: move.type || 'normal',
            power: move.power || 0,
            energy: move.energy || move.energyGain || 0,
            energyCost: move.energyCost || 0,
            cooldown: move.cooldown || move.durationMs || 1000,
            damageWindowStart: move.damageWindowStart || 0,
            damageWindowEnd: move.damageWindowEnd || move.cooldown || 1000
          };
        });
      }

      console.log(`🔄 Normalized GameMaster data:`, {
        pokemon: Object.keys(normalized.pokemon).length,
        moves: Object.keys(normalized.moves).length
      });

      return normalized;
      
    } catch (error) {
      console.error('❌ Error normalizing GameMaster data:', error);
      throw error;
    }
  }

  // Get PVP Rankings from local files
  async getPVPRankings(league, category = 'overall') {
    const cacheKey = this.getCacheKey('rankings', { league, category });
    const cached = this.getCacheItem(cacheKey);
    if (cached) {
      console.log(`📦 Using cached ${league} league rankings`);
      return cached;
    }

    try {
      console.log(`🎯 Loading ${league} league rankings from local file...`);
      
      if (!this.localDataPaths.rankings[league]) {
        throw new Error(`No local file path configured for ${league} league`);
      }

      const rawData = await this.loadLocalFile(this.localDataPaths.rankings[league]);
      
      if (!rawData || !Array.isArray(rawData)) {
        throw new Error(`Invalid ranking data structure for ${league} league`);
      }

      const processedData = this.processRankingData(rawData, league, category);
      this.setCacheItem(cacheKey, processedData);
      
      console.log(`✅ Successfully loaded ${league} league rankings (${rawData.length} Pokemon)`);
      return processedData;
      
    } catch (error) {
      console.error(`❌ Failed to load ${league} rankings:`, error);
      throw error;
    }
  }

  // Process ranking data from PVPoke format
  processRankingData(rawData, league, category) {
    try {
      return {
        categories: {
          [category]: rawData.map((pokemon, index) => ({
            rank: index + 1,
            speciesId: pokemon.speciesId,
            speciesName: pokemon.speciesName,
            score: pokemon.score || 0,
            rating: pokemon.rating || 0,
            cp: pokemon.stats?.product ? Math.sqrt(pokemon.stats.product) : this.leagues[league]?.cp || 1500,
            moves: {
              fastMove: pokemon.moveset?.[0] || pokemon.moves?.fastMoves?.[0]?.moveId || 'Unknown',
              chargedMove1: pokemon.moveset?.[1] || pokemon.moves?.chargedMoves?.[0]?.moveId || 'Unknown',
              chargedMove2: pokemon.moveset?.[2] || pokemon.moves?.chargedMoves?.[1]?.moveId || ''
            },
            stats: pokemon.stats || {}
          }))
        }
      };
    } catch (error) {
      console.error(`❌ Error processing ranking data for ${league}:`, error);
      throw error;
    }
  }

  // Get all rankings for all leagues
  async getAllRankings() {
    const cacheKey = this.getCacheKey('all_rankings');
    const cached = this.getCacheItem(cacheKey);
    if (cached) {
      console.log('📦 Using cached all rankings data');
      return cached;
    }

    try {
      console.log('🎯 Loading rankings for all leagues...');
      
      const [greatLeague, ultraLeague, masterLeague] = await Promise.all([
        this.getPVPRankings('great').catch(error => {
          console.warn('⚠️ Failed to load Great League rankings:', error.message);
          return null;
        }),
        this.getPVPRankings('ultra').catch(error => {
          console.warn('⚠️ Failed to load Ultra League rankings:', error.message);
          return null;
        }),
        this.getPVPRankings('master').catch(error => {
          console.warn('⚠️ Failed to load Master League rankings:', error.message);
          return null;
        })
      ]);

      const allRankings = {
        leagues: {
          ...(greatLeague && { great: greatLeague }),
          ...(ultraLeague && { ultra: ultraLeague }),
          ...(masterLeague && { master: masterLeague })
        },
        metadata: {
          fetchedAt: new Date().toISOString(),
          source: 'Local Ranking Files',
          fallbackUsed: false
        }
      };

      // Check if we have any data
      if (Object.keys(allRankings.leagues).length === 0) {
        throw new Error('No ranking data could be loaded from any league');
      }

      this.setCacheItem(cacheKey, allRankings);
      console.log('✅ Successfully loaded rankings for', Object.keys(allRankings.leagues).length, 'leagues');
      return allRankings;
      
    } catch (error) {
      console.error('❌ Failed to load rankings data:', error);
      console.log('🔄 Using fallback rankings data...');
      
      const fallbackRankings = {
        leagues: this.fallbackData.rankings.leagues,
        metadata: {
          fetchedAt: new Date().toISOString(),
          source: 'Fallback Data',
          fallbackUsed: true,
          originalError: error.message
        }
      };
      
      this.setCacheItem(cacheKey, fallbackRankings);
      console.log('✅ Using fallback rankings data with', Object.keys(fallbackRankings.leagues).length, 'leagues');
      return fallbackRankings;
    }
  }

  // Get comprehensive Pokemon database
  async getComprehensiveDatabase() {
    const cacheKey = this.getCacheKey('comprehensive_db');
    const cached = this.getCacheItem(cacheKey);
    if (cached) {
      console.log('📦 Using cached comprehensive database');
      return cached;
    }

    try {
      console.log('🎯 Building comprehensive Pokemon database...');
      
      // Fetch all data sources
      const [gameMaster, allRankings] = await Promise.all([
        this.getGameMasterData(),
        this.getAllRankings()
      ]);

      if (!gameMaster || !allRankings) {
        throw new Error('Failed to fetch required data sources');
      }

      // Build comprehensive database
      const database = {
        pokemon: {},
        moves: gameMaster.moves || {},
        rankings: allRankings,
        metadata: {
          createdAt: new Date().toISOString(),
          sources: ['Local GameMaster File', 'Local Ranking Files'],
          totalPokemon: Object.keys(gameMaster.pokemon || {}).length,
          totalMoves: Object.keys(gameMaster.moves || {}).length
        }
      };

      // Merge Pokemon data with rankings
      Object.entries(gameMaster.pokemon || {}).forEach(([speciesId, pokemon]) => {
        database.pokemon[speciesId] = {
          ...pokemon,
          rankings: {},
          overallScore: 0,
          bestLeague: null
        };

        // Add ranking data for each league
        let maxScore = 0;
        let bestLeague = null;

        Object.entries(allRankings.leagues || {}).forEach(([leagueKey, league]) => {
          if (league.categories && league.categories.overall) {
            const pokemonRanking = league.categories.overall.find(
              p => p.speciesId === speciesId
            );
            
            if (pokemonRanking) {
              database.pokemon[speciesId].rankings[leagueKey] = pokemonRanking;
              
              if (pokemonRanking.score > maxScore) {
                maxScore = pokemonRanking.score;
                bestLeague = leagueKey;
              }
            }
          }
        });

        database.pokemon[speciesId].overallScore = maxScore;
        database.pokemon[speciesId].bestLeague = bestLeague;
      });

      this.setCacheItem(cacheKey, database);
      
      console.log('✅ Successfully built comprehensive database');
      console.log(`📊 Database stats:`, {
        pokemon: Object.keys(database.pokemon).length,
        moves: Object.keys(database.moves).length,
        leagues: Object.keys(database.rankings.leagues).length
      });
      
      return database;
      
    } catch (error) {
      console.error('❌ Failed to build comprehensive database:', error);
      console.log('🔄 Using fallback data instead...');
      
      // Return fallback data if repository access fails
      const fallbackDatabase = {
        ...this.fallbackData,
        metadata: {
          ...this.fallbackData.metadata,
          fallbackUsed: true,
          originalError: error.message
        }
      };
      
      this.setCacheItem(cacheKey, fallbackDatabase);
      return fallbackDatabase;
    }
  }

  // Search Pokemon
  searchPokemon(database, query) {
    if (!database || !database.pokemon) return [];
    
    const searchTerm = query.toLowerCase();
    
    return Object.values(database.pokemon).filter(pokemon => {
      return pokemon.speciesName.toLowerCase().includes(searchTerm) ||
             pokemon.speciesId.toLowerCase().includes(searchTerm) ||
             pokemon.types.some(type => type.toLowerCase().includes(searchTerm));
    }).sort((a, b) => b.overallScore - a.overallScore);
  }

  // Get Pokemon by league
  getPokemonByLeague(database, league, limit = 50) {
    if (!database || !database.rankings || !database.rankings.leagues[league]) {
      return [];
    }

    const leagueData = database.rankings.leagues[league];
    if (!leagueData.categories || !leagueData.categories.overall) {
      return [];
    }

    return leagueData.categories.overall.slice(0, limit).map(ranking => {
      const pokemon = database.pokemon[ranking.speciesId];
      return {
        ...pokemon,
        ...ranking
      };
    });
  }

  // Get top performers across all leagues
  getTopPerformers(database, limit = 20) {
    if (!database || !database.pokemon) return [];

    return Object.values(database.pokemon)
      .filter(pokemon => pokemon.overallScore > 0)
      .sort((a, b) => b.overallScore - a.overallScore)
      .slice(0, limit);
  }

  // Clear cache
  clearCache() {
    this.cache.clear();
    console.log('🗑️ Cache cleared');
  }

  // Test method to verify repository connectivity
  async testConnectivity() {
    console.log('🧪 Testing repository connectivity...');
    
    const testEndpoints = [
      `${this.localDataPaths.gamemaster}`,
      `${this.localDataPaths.rankings.great}`,
      `${this.localDataPaths.rankings.ultra}`,
      `${this.localDataPaths.rankings.master}`
    ];
    
    for (const endpoint of testEndpoints) {
      try {
        console.log(`🔍 Testing: ${endpoint}`);
        const response = await fetch(endpoint);
        console.log(`📊 Test result for ${endpoint}:`, {
          status: response.status,
          statusText: response.statusText,
          contentType: response.headers.get('content-type'),
          size: response.headers.get('content-length')
        });
        
        if (response.ok) {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const data = await response.json();
            console.log(`✅ JSON data size:`, Object.keys(data).length);
          } else {
            const text = await response.text();
            console.log(`✅ Text data size:`, text.length);
          }
        }
      } catch (error) {
        console.warn(`❌ Test failed for ${endpoint}:`, error.message);
      }
    }
  }
}

export default PVPokeDataService; 