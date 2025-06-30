// Battle Calculation Service - Implements Dialgadex algorithms for raid analysis
// Based on comprehensive DPS formulas and battle simulation

class BattleCalculationService {
  constructor() {
    // Type effectiveness matrix (18x18)
    this.typeEffectiveness = this.initializeTypeChart();
    this.tierThresholds = {
      'S': 0.95,
      'A': 0.85, 
      'B': 0.70,
      'C': 0.55,
      'D': 0.40
    };
  }

  /**
   * Initialize the type effectiveness chart
   */
  initializeTypeChart() {
    const types = ['normal', 'fire', 'water', 'electric', 'grass', 'ice', 'fighting', 'poison', 
                  'ground', 'flying', 'psychic', 'bug', 'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'];
    
    // Effectiveness matrix: [attacking_type][defending_type]
    const effectiveness = {
      normal: { rock: 0.625, ghost: 0.39, steel: 0.625 },
      fire: { fire: 0.625, water: 0.625, grass: 1.6, ice: 1.6, bug: 1.6, rock: 0.625, dragon: 0.625, steel: 1.6 },
      water: { fire: 1.6, water: 0.625, grass: 0.625, ground: 1.6, rock: 1.6, dragon: 0.625 },
      electric: { water: 1.6, electric: 0.625, grass: 0.625, ground: 0.39, flying: 1.6, dragon: 0.625 },
      grass: { fire: 0.625, water: 1.6, grass: 0.625, poison: 0.625, ground: 1.6, flying: 0.625, bug: 0.625, rock: 1.6, dragon: 0.625, steel: 0.625 },
      ice: { fire: 0.625, water: 0.625, grass: 1.6, ice: 0.625, ground: 1.6, flying: 1.6, dragon: 1.6, steel: 0.625 },
      fighting: { normal: 1.6, ice: 1.6, poison: 0.625, flying: 0.625, psychic: 0.625, bug: 0.625, rock: 1.6, ghost: 0.39, dark: 1.6, steel: 1.6, fairy: 0.625 },
      poison: { grass: 1.6, poison: 0.625, ground: 0.625, rock: 0.625, ghost: 0.625, steel: 0.39, fairy: 1.6 },
      ground: { fire: 1.6, electric: 1.6, grass: 0.625, poison: 1.6, flying: 0.39, bug: 0.625, rock: 1.6, steel: 1.6 },
      flying: { electric: 0.625, grass: 1.6, ice: 0.625, fighting: 1.6, bug: 1.6, rock: 0.625, steel: 0.625 },
      psychic: { fighting: 1.6, poison: 1.6, psychic: 0.625, dark: 0.39, steel: 0.625 },
      bug: { fire: 0.625, grass: 1.6, fighting: 0.625, poison: 0.625, flying: 0.625, psychic: 1.6, ghost: 0.625, dark: 1.6, steel: 0.625, fairy: 0.625 },
      rock: { fire: 1.6, ice: 1.6, fighting: 0.625, ground: 0.625, flying: 1.6, bug: 1.6, steel: 0.625 },
      ghost: { normal: 0.39, psychic: 1.6, ghost: 1.6, dark: 0.625 },
      dragon: { dragon: 1.6, steel: 0.625, fairy: 0.39 },
      dark: { fighting: 0.625, psychic: 1.6, ghost: 1.6, dark: 0.625, fairy: 0.625 },
      steel: { fire: 0.625, water: 0.625, electric: 0.625, ice: 1.6, rock: 1.6, steel: 0.625, fairy: 1.6 },
      fairy: { fire: 0.625, fighting: 1.6, poison: 0.625, dragon: 1.6, dark: 1.6, steel: 0.625 }
    };

    return effectiveness;
  }

  /**
   * Get type effectiveness multiplier
   */
  getTypeEffectiveness(attackingType, defendingTypes) {
    let multiplier = 1.0;
    
    defendingTypes.forEach(defType => {
      if (this.typeEffectiveness[attackingType] && this.typeEffectiveness[attackingType][defType]) {
        multiplier *= this.typeEffectiveness[attackingType][defType];
      }
    });
    
    return multiplier;
  }

  /**
   * Calculate damage for a move
   */
  calculateDamage(attackStat, defenseStat, power, typeEffectiveness, stab = false, weather = false) {
    let damage = Math.floor(0.5 * power * (attackStat / defenseStat)) + 1;
    
    if (stab) damage *= 1.2;
    if (weather) damage *= 1.2;
    damage *= typeEffectiveness;
    
    return Math.floor(damage);
  }

  /**
   * Calculate comprehensive DPS using Dialgadex formula
   */
  calculateDPS(pokemon, fastMove, chargedMove, enemyTypes = [], enemyDefense = 180) {
    if (!fastMove || !chargedMove) return 0;

    const atk = pokemon.baseStats.atk || pokemon.stats?.atk || 200;
    const def = pokemon.baseStats.def || pokemon.stats?.def || 180;
    const hp = pokemon.baseStats.hp || pokemon.stats?.hp || 180;
    
    // Type effectiveness
    const fmEffectiveness = this.getTypeEffectiveness(fastMove.type, enemyTypes);
    const cmEffectiveness = this.getTypeEffectiveness(chargedMove.type, enemyTypes);
    
    // STAB (Same Type Attack Bonus)
    const fmStab = pokemon.types.includes(fastMove.type) ? 1.2 : 1.0;
    const cmStab = pokemon.types.includes(chargedMove.type) ? 1.2 : 1.0;
    
    // Fast move calculations
    const fmDamage = this.calculateDamage(atk, enemyDefense, fastMove.power, fmEffectiveness, fmStab);
    const fmDuration = (fastMove.cooldown || 1000) / 1000; // Convert to seconds
    const fmDPS = fmDamage / fmDuration;
    const fmEPS = (fastMove.energyGain || 0) / fmDuration;
    
    // Charged move calculations  
    const cmDamage = this.calculateDamage(atk, enemyDefense, chargedMove.power, cmEffectiveness, cmStab);
    const cmDuration = (chargedMove.cooldown || 500) / 1000;
    const cmDPS = cmDamage / cmDuration;
    const cmEPS = Math.abs(chargedMove.energy || 50) / cmDuration;
    
    // Comprehensive DPS formula
    if (fmEPS === 0 || cmEPS === 0) return fmDPS;
    
    const cycleDPS = (fmDPS * cmEPS + cmDPS * fmEPS) / (cmEPS + fmEPS);
    
    return Math.round(cycleDPS * 100) / 100;
  }

  /**
   * Calculate Total Damage Output (TDO)
   */
  calculateTDO(pokemon, dps, enemyDPS = 15) {
    const hp = pokemon.baseStats.hp || pokemon.stats?.hp || 180;
    const def = pokemon.baseStats.def || pokemon.stats?.def || 180;
    
    const timeToFaint = hp / (enemyDPS * (200 / def));
    return Math.round(dps * timeToFaint);
  }

  /**
   * Calculate Pokemon's performance against specific enemy types
   */
  calculateAgainstTypes(pokemon, moves, enemyTypes) {
    if (!moves.fastMoves || !moves.chargedMoves) {
      return { dps: 0, tdo: 0, tier: 'F', bestMoveset: null };
    }

    let bestDPS = 0;
    let bestTDO = 0;
    let bestMoveset = null;

    // Test all moveset combinations
    moves.fastMoves.forEach(fastMove => {
      moves.chargedMoves.forEach(chargedMove => {
        const dps = this.calculateDPS(pokemon, fastMove, chargedMove, enemyTypes);
        const tdo = this.calculateTDO(pokemon, dps);
        
        if (dps > bestDPS) {
          bestDPS = dps;
          bestTDO = tdo;
          bestMoveset = {
            fastMove: fastMove.moveId || fastMove.name,
            chargedMove: chargedMove.moveId || chargedMove.name,
            dps: dps,
            tdo: tdo
          };
        }
      });
    });

    return {
      dps: bestDPS,
      tdo: bestTDO,
      tier: this.calculateTier(bestDPS),
      bestMoveset: bestMoveset
    };
  }

  /**
   * Calculate tier based on DPS performance
   */
  calculateTier(dps, maxDPS = 25) {
    const ratio = dps / maxDPS;
    
    if (ratio >= this.tierThresholds.S) return 'S';
    if (ratio >= this.tierThresholds.A) return 'A';
    if (ratio >= this.tierThresholds.B) return 'B';
    if (ratio >= this.tierThresholds.C) return 'C';
    if (ratio >= this.tierThresholds.D) return 'D';
    return 'F';
  }

  /**
   * Get Pokemon's raid analysis against all major types
   */
  getRaidAnalysis(pokemon, moves) {
    const majorTypes = ['fire', 'water', 'grass', 'electric', 'ice', 'fighting', 'poison', 
                       'ground', 'flying', 'psychic', 'bug', 'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'];
    
    const analysis = {};
    
    majorTypes.forEach(type => {
      analysis[type] = this.calculateAgainstTypes(pokemon, moves, [type]);
    });
    
    // Overall rating (average of all types)
    const avgDPS = Object.values(analysis).reduce((sum, data) => sum + data.dps, 0) / majorTypes.length;
    analysis.overall = {
      dps: avgDPS,
      tier: this.calculateTier(avgDPS),
      bestType: majorTypes.reduce((best, type) => 
        analysis[type].dps > analysis[best].dps ? type : best, majorTypes[0])
    };
    
    return analysis;
  }

  /**
   * Get evolution family performance summary
   */
  getEvolutionFamilyAnalysis(evolutionFamily, allMoves) {
    const familyAnalysis = {};
    
    evolutionFamily.forEach(pokemon => {
      const moves = this.getPokemonMoves(pokemon, allMoves);
      familyAnalysis[pokemon.speciesId] = this.getRaidAnalysis(pokemon, moves);
    });
    
    return familyAnalysis;
  }

  /**
   * Extract Pokemon's available moves
   */
  getPokemonMoves(pokemon, allMoves) {
    const moves = {
      fastMoves: [],
      chargedMoves: []
    };
    
    // Get fast moves
    if (pokemon.fastMoves) {
      pokemon.fastMoves.forEach(moveId => {
        const move = allMoves.find(m => m.moveId === moveId);
        if (move) moves.fastMoves.push(move);
      });
    }
    
    // Get charged moves
    if (pokemon.chargedMoves) {
      pokemon.chargedMoves.forEach(moveId => {
        const move = allMoves.find(m => m.moveId === moveId);
        if (move) moves.chargedMoves.push(move);
      });
    }
    
    return moves;
  }
}

export default new BattleCalculationService(); 