// DialgaDex-inspired tier ranking service
class TierRankingService {
  constructor() {
    this.pokemonTypes = [
      'normal', 'fire', 'water', 'grass', 'electric', 'ice',
      'fighting', 'poison', 'ground', 'flying', 'psychic', 
      'bug', 'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'
    ];
    
    this.tiers = ['S+', 'S', 'A', 'B', 'C', 'D'];
    
    // Type effectiveness chart (attacking type vs defending type)
    this.typeChart = {
      normal: { fighting: 2, ghost: 0 },
      fire: { fire: 0.5, water: 0.5, grass: 2, ice: 2, bug: 2, rock: 0.5, dragon: 0.5, steel: 2 },
      water: { fire: 2, water: 0.5, grass: 0.5, ground: 2, rock: 2, dragon: 0.5 },
      grass: { fire: 0.5, water: 2, grass: 0.5, poison: 0.5, ground: 2, flying: 0.5, bug: 0.5, rock: 2, dragon: 0.5, steel: 0.5 },
      electric: { water: 2, grass: 0.5, ground: 0, flying: 2, dragon: 0.5, electric: 0.5 },
      ice: { fire: 0.5, water: 0.5, grass: 2, ice: 0.5, ground: 2, flying: 2, dragon: 2, steel: 0.5 },
      fighting: { normal: 2, ice: 2, poison: 0.5, ground: 0, flying: 0.5, psychic: 0.5, bug: 0.5, rock: 2, ghost: 0, dark: 2, steel: 2, fairy: 0.5 },
      poison: { grass: 2, poison: 0.5, ground: 0.5, rock: 0.5, ghost: 0.5, steel: 0, fairy: 2 },
      ground: { fire: 2, electric: 2, grass: 0.5, poison: 2, flying: 0, bug: 0.5, rock: 2, steel: 2 },
      flying: { electric: 0.5, grass: 2, ice: 0.5, fighting: 2, bug: 2, rock: 0.5, steel: 0.5 },
      psychic: { fighting: 2, poison: 2, psychic: 0.5, dark: 0, steel: 0.5 },
      bug: { fire: 0.5, grass: 2, fighting: 0.5, poison: 0.5, flying: 0.5, psychic: 2, ghost: 0.5, dark: 2, steel: 0.5, fairy: 0.5 },
      rock: { fire: 2, ice: 2, fighting: 0.5, ground: 0.5, flying: 2, bug: 2, steel: 0.5 },
      ghost: { normal: 0, psychic: 2, ghost: 2, dark: 0.5 },
      dragon: { dragon: 2, steel: 0.5, fairy: 0 },
      dark: { fighting: 0.5, psychic: 2, ghost: 2, dark: 0.5, fairy: 0.5 },
      steel: { fire: 0.5, water: 0.5, electric: 0.5, ice: 2, rock: 2, steel: 0.5, fairy: 2 },
      fairy: { fire: 0.5, fighting: 2, poison: 0.5, dragon: 2, dark: 2, steel: 0.5 }
    };
  }

  // Calculate eDPS (Effective DPS) based on DialgaDex methodology
  calculateeDPS(pokemon, attackerType = null, defenderType = null) {
    if (!pokemon || !pokemon.stats) return 0;

    const { attack = 100, defense = 100, stamina = 100 } = pokemon.stats;
    
    // Base DPS calculation
    const baseDPS = attack * 0.8; // Simplified DPS formula
    
    // TDO (Total Damage Output)
    const tdo = (attack * stamina) / 100;
    
    // Type effectiveness multiplier
    let typeMultiplier = 1;
    if (attackerType && defenderType) {
      typeMultiplier = this.getTypeEffectiveness(attackerType, defenderType);
    }
    
    // Shadow bonus (if applicable)
    const shadowMultiplier = pokemon.shadow ? 1.2 : 1;
    
    // eDPS calculation (simplified version of DialgaDex formula)
    // eDPS = DPS * (TDO / (TDO + relobbyTime))
    const relobbyTime = 20; // seconds
    const effectiveTDO = tdo * typeMultiplier * shadowMultiplier;
    const eDPS = baseDPS * typeMultiplier * shadowMultiplier * (effectiveTDO / (effectiveTDO + relobbyTime));
    
    return Math.round(eDPS * 100) / 100;
  }

  // Get type effectiveness multiplier
  getTypeEffectiveness(attackType, defendType) {
    if (!attackType || !defendType) return 1;
    
    const effectiveness = this.typeChart[attackType.toLowerCase()]?.[defendType.toLowerCase()];
    return effectiveness !== undefined ? effectiveness : 1;
  }

  // Jenks Natural Breaks algorithm for tier determination
  jenksBreaks(values, numClasses) {
    if (values.length <= numClasses) {
      return values.sort((a, b) => b - a);
    }

    values = values.sort((a, b) => b - a); // Sort descending for tiers
    const n = values.length;
    
    // Initialize matrices
    const mat1 = Array(n + 1).fill().map(() => Array(numClasses + 1).fill(0));
    const mat2 = Array(n + 1).fill().map(() => Array(numClasses + 1).fill(0));
    
    // Fill matrices with large values
    for (let i = 1; i <= numClasses; i++) {
      mat1[1][i] = 1;
      mat2[1][i] = 0;
      for (let j = 2; j <= n; j++) {
        mat2[j][i] = Infinity;
      }
    }
    
    // Dynamic programming
    for (let l = 2; l <= n; l++) {
      let s1 = 0, s2 = 0, w = 0;
      
      for (let m = 1; m <= l; m++) {
        const i3 = l - m + 1;
        const val = values[i3 - 1];
        
        s2 += val * val;
        s1 += val;
        w++;
        
        const v = s2 - (s1 * s1) / w;
        const i4 = i3 - 1;
        
        if (i4 !== 0) {
          for (let j = 2; j <= numClasses; j++) {
            if (mat2[l][j] >= (v + mat2[i4][j - 1])) {
              mat1[l][j] = i3;
              mat2[l][j] = v + mat2[i4][j - 1];
            }
          }
        }
      }
      
      mat1[l][1] = 1;
      mat2[l][1] = s2 - (s1 * s1) / w;
    }
    
    // Extract breaks
    const breaks = [];
    let k = n;
    
    for (let j = numClasses; j >= 2; j--) {
      const id = mat1[k][j] - 2;
      breaks.push(values[id]);
      k = mat1[k][j] - 1;
    }
    
    breaks.push(values[0]); // Add maximum value
    return breaks.reverse();
  }

  // Calculate tier for a Pokemon based on score and breaks
  calculateTier(score, breaks) {
    for (let i = 0; i < breaks.length; i++) {
      if (score >= breaks[i]) {
        return this.tiers[i] || 'D';
      }
    }
    return 'D';
  }

  // Generate type-specific rankings
  generateTypeRankings(pokemonList, type) {
    if (!pokemonList || pokemonList.length === 0) return [];

    // Filter Pokemon that can use moves of this type or are of this type
    const typeRelevantPokemon = pokemonList.filter(pokemon => {
      if (!pokemon) return false;
      
      // Check if Pokemon is of this type
      const isOfType = pokemon.types?.includes(type);
      
      // Check if Pokemon can learn moves of this type (simplified check)
      const hasTypeMoves = pokemon.moves?.some(move => move.type === type);
      
      return isOfType || hasTypeMoves;
    });

    // Calculate scores for each Pokemon against common targets of this type
    const scoredPokemon = typeRelevantPokemon.map(pokemon => {
      // Calculate average effectiveness against types weak to this type
      const weakTypes = this.getWeakToType(type);
      let totalScore = 0;
      let scoreCount = 0;

      weakTypes.forEach(weakType => {
        const score = this.calculateeDPS(pokemon, type, weakType);
        totalScore += score;
        scoreCount++;
      });

      const averageScore = scoreCount > 0 ? totalScore / scoreCount : 0;
      
      return {
        ...pokemon,
        typeScore: averageScore,
        recommendedMoveType: type
      };
    });

    // Sort by score (descending)
    scoredPokemon.sort((a, b) => b.typeScore - a.typeScore);

    // Calculate tiers using Jenks algorithm
    const scores = scoredPokemon.map(p => p.typeScore);
    const breaks = this.jenksBreaks(scores, 6); // 6 tiers (S+, S, A, B, C, D)

    // Assign tiers
    const rankedPokemon = scoredPokemon.map((pokemon, index) => ({
      ...pokemon,
      rank: index + 1,
      tier: this.calculateTier(pokemon.typeScore, breaks),
      percentile: Math.round((1 - index / scoredPokemon.length) * 100)
    }));

    return rankedPokemon;
  }

  // Get types that are weak to the given type
  getWeakToType(attackType) {
    const weakTypes = [];
    
    Object.keys(this.typeChart).forEach(defendType => {
      const effectiveness = this.getTypeEffectiveness(attackType, defendType);
      if (effectiveness > 1) {
        weakTypes.push(defendType);
      }
    });
    
    return weakTypes.length > 0 ? weakTypes : ['normal']; // Default to normal if no weaknesses
  }

  // Generate comprehensive rankings across all types
  generateComprehensiveRankings(pokemonList) {
    const results = {
      overall: [],
      byType: {},
      metadata: {
        totalPokemon: pokemonList.length,
        generatedAt: new Date().toISOString(),
        algorithm: 'DialgaDex-inspired Jenks Natural Breaks'
      }
    };

    // Generate overall rankings
    const overallScored = pokemonList.map(pokemon => {
      if (!pokemon) return null;

      // Calculate composite score across all types
      let totalScore = 0;
      let typeCount = 0;

      this.pokemonTypes.forEach(type => {
        if (pokemon.types?.includes(type)) {
          const score = this.calculateeDPS(pokemon, type);
          totalScore += score;
          typeCount++;
        }
      });

      const averageScore = typeCount > 0 ? totalScore / typeCount : 0;
      
      return {
        ...pokemon,
        overallScore: averageScore
      };
    }).filter(Boolean);

    // Sort and rank overall
    overallScored.sort((a, b) => b.overallScore - a.overallScore);
    
    const overallScores = overallScored.map(p => p.overallScore);
    const overallBreaks = this.jenksBreaks(overallScores, 6);

    results.overall = overallScored.map((pokemon, index) => ({
      ...pokemon,
      rank: index + 1,
      tier: this.calculateTier(pokemon.overallScore, overallBreaks),
      percentile: Math.round((1 - index / overallScored.length) * 100)
    }));

    // Generate type-specific rankings
    this.pokemonTypes.forEach(type => {
      results.byType[type] = this.generateTypeRankings(pokemonList, type);
    });

    return results;
  }

  // Generate counter rankings (best Pokemon to use against each type)
  generateCounterRankings(pokemonList) {
    const counterRankings = {};

    this.pokemonTypes.forEach(targetType => {
      // Find Pokemon that are effective against this type
      const effectivePokemon = pokemonList.map(pokemon => {
        if (!pokemon) return null;

        let bestScore = 0;
        let bestAttackType = null;

        // Check all types this Pokemon can use
        const availableTypes = [
          ...(pokemon.types || []),
          ...(pokemon.moves?.map(move => move.type) || [])
        ];

        [...new Set(availableTypes)].forEach(attackType => {
          const effectiveness = this.getTypeEffectiveness(attackType, targetType);
          if (effectiveness > 1) {
            const score = this.calculateeDPS(pokemon, attackType, targetType);
            if (score > bestScore) {
              bestScore = score;
              bestAttackType = attackType;
            }
          }
        });

        return bestScore > 0 ? {
          ...pokemon,
          counterScore: bestScore,
          bestAttackType: bestAttackType,
          effectiveness: this.getTypeEffectiveness(bestAttackType, targetType)
        } : null;
      }).filter(Boolean);

      // Sort by effectiveness
      effectivePokemon.sort((a, b) => b.counterScore - a.counterScore);

      // Calculate tiers
      const scores = effectivePokemon.map(p => p.counterScore);
      const breaks = this.jenksBreaks(scores, 6);

      counterRankings[targetType] = effectivePokemon.map((pokemon, index) => ({
        ...pokemon,
        rank: index + 1,
        tier: this.calculateTier(pokemon.counterScore, breaks),
        percentile: Math.round((1 - index / effectivePokemon.length) * 100)
      }));
    });

    return counterRankings;
  }

  // Get tier statistics for a ranking
  getTierStatistics(rankings) {
    const stats = {};
    
    this.tiers.forEach(tier => {
      stats[tier] = rankings.filter(pokemon => pokemon.tier === tier).length;
    });

    return {
      ...stats,
      total: rankings.length,
      averageScore: rankings.reduce((sum, p) => sum + (p.typeScore || p.overallScore || p.counterScore || 0), 0) / rankings.length
    };
  }

  // Export rankings to a structured format
  exportRankings(rankings, type = 'overall') {
    return {
      type: type,
      rankings: rankings.map(pokemon => ({
        rank: pokemon.rank,
        name: pokemon.name,
        id: pokemon.id,
        types: pokemon.types,
        tier: pokemon.tier,
        score: pokemon.typeScore || pokemon.overallScore || pokemon.counterScore || 0,
        percentile: pokemon.percentile,
        stats: pokemon.stats,
        shadow: pokemon.shadow || false,
        bestAttackType: pokemon.bestAttackType,
        effectiveness: pokemon.effectiveness
      })),
      statistics: this.getTierStatistics(rankings),
      metadata: {
        algorithm: 'DialgaDex-inspired Jenks Natural Breaks',
        generatedAt: new Date().toISOString(),
        totalEntries: rankings.length
      }
    };
  }
}

export default TierRankingService; 