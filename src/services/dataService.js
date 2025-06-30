// Pokemon GO Data Service - Real data only from PVPoke and DialgaDex
class DataService {
  constructor() {
    this.baseUrls = {
      pvpoke: 'https://pvpoke.com',
      dialgadex: 'https://www.dialgadex.com',
      dialgadexGithub: 'https://raw.githubusercontent.com/mgrann03/dialgadex/main'
    };
    
    this.cache = new Map();
    this.cacheExpiry = 30 * 60 * 1000; // 30 minutes
  }

  // Cache management
  setCacheItem(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  getCacheItem(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() - item.timestamp > this.cacheExpiry) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }

  // Enhanced fetch with multiple strategies
  async fetchWithRetry(url, retries = 2) {
    console.log(`🔍 Attempting to fetch: ${url}`);
    
    // Try different fetch strategies
    const strategies = [
      // Strategy 1: Direct fetch with minimal headers
      () => this.directFetch(url),
      // Strategy 2: Use different CORS proxy services
      () => this.proxyFetch(url, 'https://api.allorigins.win/raw?url='),
      () => this.proxyFetch(url, 'https://corsproxy.io/?'),
      () => this.proxyFetch(url, 'https://cors-anywhere.herokuapp.com/'),
      // Strategy 3: Try with different headers
      () => this.fetchWithHeaders(url)
    ];

    for (let i = 0; i < strategies.length; i++) {
      try {
        console.log(`🔄 Trying strategy ${i + 1}/${strategies.length}`);
        const data = await strategies[i]();
        if (data) {
          console.log(`✅ Successfully fetched data using strategy ${i + 1}`);
          return data;
        }
      } catch (error) {
        console.warn(`❌ Strategy ${i + 1} failed:`, error.message);
      }
    }
    
    if (retries > 0) {
      console.warn(`🔄 Retrying... (${retries} attempts left)`);
      await new Promise(resolve => setTimeout(resolve, 2000));
      return this.fetchWithRetry(url, retries - 1);
    }
    
    throw new Error(`Failed to fetch ${url} after all strategies and retries`);
  }

  async directFetch(url) {
    const response = await fetch(url, {
      method: 'GET',
      mode: 'cors',
      credentials: 'omit'
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    } else {
      const text = await response.text();
      try {
        return JSON.parse(text);
      } catch {
        return text;
      }
    }
  }

  async proxyFetch(url, proxyUrl) {
    const finalUrl = proxyUrl + encodeURIComponent(url);
    const response = await fetch(finalUrl, {
      method: 'GET',
      mode: 'cors'
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  }

  async fetchWithHeaders(url) {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      mode: 'cors'
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    } else {
      const text = await response.text();
      try {
        return JSON.parse(text);
      } catch {
        return text;
      }
    }
  }

  // Get PVPoke Rankings - Only real data
  async getPVPokeRankings(league = 'great') {
    const cacheKey = `pvpoke_rankings_${league}`;
    const cached = this.getCacheItem(cacheKey);
    if (cached) {
      console.log(`📦 Using cached ${league} league rankings`);
      return cached;
    }

    try {
      console.log(`🔍 Fetching PVPoke ${league} league rankings...`);
      
      const cpLimits = { great: 1500, ultra: 2500, master: 10000 };
      const cpLimit = cpLimits[league] || 1500;
      
      // Try multiple potential endpoints
      const endpoints = [
        `${this.baseUrls.pvpoke}/data/rankings/${league}/${cpLimit}/overall.json`,
        `${this.baseUrls.pvpoke}/data/rankings/${league}/overall.json`,
        `${this.baseUrls.pvpoke}/rankings/${league}/${cpLimit}/overall.json`,
        `${this.baseUrls.pvpoke}/data/rankings/all/${cpLimit}/overall.json`
      ];

      for (const endpoint of endpoints) {
        try {
          console.log(`🎯 Trying endpoint: ${endpoint}`);
          const data = await this.fetchWithRetry(endpoint, 1);
          
          if (data && Array.isArray(data) && data.length > 0) {
            console.log(`✅ Successfully fetched ${league} league rankings from PVPoke (${data.length} Pokemon)`);
            this.setCacheItem(cacheKey, data);
            return data;
          }
        } catch (error) {
          console.warn(`❌ Endpoint failed: ${endpoint} - ${error.message}`);
        }
      }

      throw new Error(`No valid PVPoke ${league} league data found from any endpoint`);
      
    } catch (error) {
      console.error(`❌ Failed to fetch PVPoke ${league} rankings:`, error.message);
      return null;
    }
  }

  // Get DialgaDex raid data - Only real data
  async getDialgaDexRaidData() {
    const cacheKey = 'dialgadex_raids';
    const cached = this.getCacheItem(cacheKey);
    if (cached) {
      console.log('📦 Using cached DialgaDex raid data');
      return cached;
    }

    try {
      console.log('🔍 Fetching DialgaDex raid data...');
      
      // Try GitHub repository endpoints
      const githubEndpoints = [
        `${this.baseUrls.dialgadexGithub}/data.json`,
        `${this.baseUrls.dialgadexGithub}/src/data.json`,
        `${this.baseUrls.dialgadexGithub}/res/data.json`,
        `${this.baseUrls.dialgadexGithub}/public/data.json`
      ];

      for (const endpoint of githubEndpoints) {
        try {
          console.log(`🎯 Trying GitHub endpoint: ${endpoint}`);
          const data = await this.fetchWithRetry(endpoint, 1);
          
          if (data && (data.pokemon || data.raids || Array.isArray(data))) {
            console.log('✅ Successfully fetched DialgaDex data from GitHub repository');
            const normalized = this.normalizeDialgaDexData(data);
            this.setCacheItem(cacheKey, normalized);
            return normalized;
          }
        } catch (error) {
          console.warn(`❌ GitHub endpoint failed: ${endpoint} - ${error.message}`);
        }
      }

      // Try live site endpoints
      const liveEndpoints = [
        `${this.baseUrls.dialgadex}/api/raids`,
        `${this.baseUrls.dialgadex}/data/raids.json`,
        `${this.baseUrls.dialgadex}/api/data`,
        `${this.baseUrls.dialgadex}/data.json`
      ];

      for (const endpoint of liveEndpoints) {
        try {
          console.log(`🎯 Trying live endpoint: ${endpoint}`);
          const data = await this.fetchWithRetry(endpoint, 1);
          
          if (data && (data.current || data.raids || Array.isArray(data))) {
            console.log('✅ Successfully fetched DialgaDex data from live site');
            const normalized = this.normalizeDialgaDexData(data);
            this.setCacheItem(cacheKey, normalized);
            return normalized;
          }
        } catch (error) {
          console.warn(`❌ Live endpoint failed: ${endpoint} - ${error.message}`);
        }
      }

      throw new Error('No valid DialgaDex raid data found from any endpoint');
      
    } catch (error) {
      console.error('❌ Failed to fetch DialgaDex raid data:', error.message);
      return null;
    }
  }

  // Normalize DialgaDex data
  normalizeDialgaDexData(data) {
    try {
      if (!data) return null;

      console.log('🔄 Normalizing DialgaDex data...');

      // Handle different data structures
      if (Array.isArray(data)) {
        return this.processRaidArray(data);
      }

      if (data.pokemon) {
        return this.createRaidStructureFromPokemon(data.pokemon);
      }

      if (data.current || data.raids) {
        return {
          current: data.current || data.raids || {},
          previous: data.previous || {},
          metadata: {
            lastUpdated: new Date().toISOString(),
            source: 'DialgaDex',
            count: Object.keys(data.current || data.raids || {}).length
          }
        };
      }

      console.warn('⚠️ Unknown DialgaDex data structure');
      return null;
    } catch (error) {
      console.error('❌ Error normalizing DialgaDex data:', error);
      return null;
    }
  }

  // Process raid array structure
  processRaidArray(raidArray) {
    const processed = {
      current: {},
      metadata: {
        lastUpdated: new Date().toISOString(),
        source: 'DialgaDex',
        count: raidArray.length
      }
    };
    
    // Group by tier
    const tierGroups = {};
    raidArray.forEach((boss, index) => {
      const tier = boss.tier || this.guessTierFromCP(boss.cp) || 1;
      if (!tierGroups[tier]) tierGroups[tier] = [];
      
      tierGroups[tier].push({
        id: boss.id || index,
        name: boss.name || boss.pokemon_name || `Pokemon ${index}`,
        form: boss.form || 'Normal',
        types: boss.types || boss.type || ['normal'],
        tier: tier,
        cp: this.normalizeCP(boss.cp),
        shiny: boss.shiny_available || boss.shiny || false,
        boostedWeather: boss.boosted_weather || []
      });
    });
    
    processed.current = tierGroups;
    return processed;
  }

  // Create raid structure from Pokemon data
  createRaidStructureFromPokemon(pokemonData) {
    const processed = {
      current: {},
      metadata: {
        lastUpdated: new Date().toISOString(),
        source: 'DialgaDex',
        count: Object.keys(pokemonData).length
      }
    };

    if (Array.isArray(pokemonData)) {
      return this.processRaidArray(pokemonData);
    }

    if (typeof pokemonData === 'object') {
      Object.keys(pokemonData).forEach(key => {
        const pokemon = pokemonData[key];
        const tier = pokemon.tier || 3;
        
        if (!processed.current[tier]) processed.current[tier] = [];
        
        processed.current[tier].push({
          id: pokemon.id || key,
          name: pokemon.name || key,
          types: pokemon.types || ['normal'],
          tier: tier,
          cp: this.normalizeCP(pokemon.cp),
          shiny: pokemon.shiny || false
        });
      });
    }

    return processed;
  }

  // Guess tier from CP
  guessTierFromCP(cp) {
    if (!cp) return 1;
    
    const maxCP = typeof cp === 'object' ? (cp.max || cp.maximum) : cp;
    
    if (maxCP > 60000) return 5;
    if (maxCP > 40000) return 4;
    if (maxCP > 20000) return 3;
    if (maxCP > 10000) return 2;
    return 1;
  }

  // Normalize CP structure
  normalizeCP(cpData) {
    if (typeof cpData === 'number') {
      return {
        min: Math.floor(cpData * 0.8),
        max: cpData,
        minBoosted: Math.floor(cpData * 0.84),
        maxBoosted: Math.floor(cpData * 1.05)
      };
    }
    
    if (typeof cpData === 'object') {
      return {
        min: cpData.min || cpData.minimum || 0,
        max: cpData.max || cpData.maximum || 0,
        minBoosted: cpData.minBoosted || cpData.min_boosted || Math.floor((cpData.min || 0) * 1.05),
        maxBoosted: cpData.maxBoosted || cpData.max_boosted || Math.floor((cpData.max || 0) * 1.05)
      };
    }
    
    return { min: 0, max: 0, minBoosted: 0, maxBoosted: 0 };
  }

  // Main data fetching method - Real data only
  async getAllData() {
    try {
      console.log('=== 🚀 POKEMON GO DATA SERVICE STARTING ===');
      console.log('🎯 Fetching REAL data from PVPoke and DialgaDex...');
      
      // Fetch data from real sources
      const dataPromises = {
        greatLeague: this.getPVPokeRankings('great'),
        ultraLeague: this.getPVPokeRankings('ultra'),
        masterLeague: this.getPVPokeRankings('master'),
        raidData: this.getDialgaDexRaidData()
      };

      console.log('🔄 Starting parallel data fetch...');
      const results = await Promise.allSettled(Object.values(dataPromises));
      
      // Process results - only return data if we actually got real data
      const [greatLeague, ultraLeague, masterLeague, raidData] = results;

      const finalData = {
        pvpRankings: {
          great: greatLeague.status === 'fulfilled' && greatLeague.value ? greatLeague.value : null,
          ultra: ultraLeague.status === 'fulfilled' && ultraLeague.value ? ultraLeague.value : null,
          master: masterLeague.status === 'fulfilled' && masterLeague.value ? masterLeague.value : null
        },
        raidData: raidData.status === 'fulfilled' && raidData.value ? raidData.value : null,
        lastUpdated: new Date().toISOString(),
        dataStatus: {
          greatLeague: greatLeague.status === 'fulfilled' && greatLeague.value ? 'success' : 'failed',
          ultraLeague: ultraLeague.status === 'fulfilled' && ultraLeague.value ? 'success' : 'failed',
          masterLeague: masterLeague.status === 'fulfilled' && masterLeague.value ? 'success' : 'failed',
          raidData: raidData.status === 'fulfilled' && raidData.value ? 'success' : 'failed'
        }
      };

      // Check if we got any real data at all
      const hasAnyData = Object.values(finalData.pvpRankings).some(league => league !== null) || 
                        finalData.raidData !== null;

      if (!hasAnyData) {
        throw new Error('Unable to fetch any real data from PVPoke or DialgaDex');
      }

      console.log('=== ✅ DATA FETCH COMPLETE ===');
      console.log('📊 Data Status:', finalData.dataStatus);
      console.log('🎮 PVP Rankings:', Object.entries(finalData.pvpRankings).map(([k, v]) => 
        `${k}: ${v ? v.length + ' Pokemon' : 'Failed'}`
      ));
      console.log('⚔️ Raid data:', finalData.raidData ? 'Loaded' : 'Failed');
      
      return finalData;
      
    } catch (error) {
      console.error('=== ❌ DATA FETCH FAILED ===');
      console.error('Error:', error.message);
      
      // Return error state instead of fallback data
      throw new Error(`Failed to fetch real Pokemon GO data: ${error.message}`);
    }
  }

  // Clear cache
  clearCache() {
    this.cache.clear();
    console.log('🗑️ Cache cleared');
  }

  // Get cache status
  getCacheStatus() {
    const status = {};
    for (const [key, item] of this.cache.entries()) {
      status[key] = {
        size: JSON.stringify(item.data).length,
        age: Date.now() - item.timestamp,
        expires: this.cacheExpiry - (Date.now() - item.timestamp)
      };
    }
    return status;
  }
}

export default new DataService(); 