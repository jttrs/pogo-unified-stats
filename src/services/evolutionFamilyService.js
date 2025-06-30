// Evolution Family Service - Manages Pokemon evolution families and groupings

class EvolutionFamilyService {
  constructor() {
    this.familyCache = new Map();
    this.evolutionTrees = new Map();
  }

  /**
   * Build evolution families from Pokemon data
   */
  buildEvolutionFamilies(pokemonData) {
    this.familyCache.clear();
    this.evolutionTrees.clear();
    
    // Group Pokemon by family ID
    const families = {};
    
    pokemonData.forEach(pokemon => {
      if (pokemon.family && pokemon.family.id) {
        const familyId = pokemon.family.id;
        
        if (!families[familyId]) {
          families[familyId] = [];
        }
        
        families[familyId].push(pokemon);
      }
    });
    
    // Build evolution trees for each family
    Object.keys(families).forEach(familyId => {
      const family = families[familyId];
      const tree = this.buildEvolutionTree(family);
      
      this.evolutionTrees.set(familyId, tree);
      
      // Cache family for each Pokemon
      family.forEach(pokemon => {
        this.familyCache.set(pokemon.speciesId, {
          familyId,
          family: family,
          tree: tree,
          lowestDexNumber: this.getLowestDexNumber(family)
        });
      });
    });
    
    console.log(`✅ Built ${this.evolutionTrees.size} evolution families`);
    return this.familyCache;
  }

  /**
   * Build evolution tree structure
   */
  buildEvolutionTree(family) {
    const tree = {
      base: [],
      stage1: [],
      stage2: [],
      mega: [],
      shadow: [],
      regional: []
    };
    
    family.forEach(pokemon => {
      // Categorize by evolution stage and variant
      if (pokemon.tags?.includes('mega')) {
        tree.mega.push(pokemon);
      } else if (pokemon.tags?.includes('shadow')) {
        tree.shadow.push(pokemon);
      } else if (pokemon.speciesName.includes('Alolan') || 
                 pokemon.speciesName.includes('Galarian') || 
                 pokemon.speciesName.includes('Hisuian')) {
        tree.regional.push(pokemon);
      } else if (!pokemon.family.parent) {
        tree.base.push(pokemon);
      } else if (pokemon.family.evolutions && pokemon.family.evolutions.length > 0) {
        tree.stage1.push(pokemon);
      } else {
        tree.stage2.push(pokemon);
      }
    });
    
    // Sort each stage by dex number
    Object.keys(tree).forEach(stage => {
      tree[stage].sort((a, b) => (a.dex || 999) - (b.dex || 999));
    });
    
    return tree;
  }

  /**
   * Get the lowest dex number in a family (for sorting families)
   */
  getLowestDexNumber(family) {
    return Math.min(...family.map(pokemon => pokemon.dex || 999));
  }

  /**
   * Get evolution family for a Pokemon
   */
  getFamily(pokemonId) {
    return this.familyCache.get(pokemonId);
  }

  /**
   * Get all families sorted by lowest dex number
   */
  getAllFamilies() {
    const families = new Map();
    
    this.familyCache.forEach((familyData, pokemonId) => {
      if (!families.has(familyData.familyId)) {
        families.set(familyData.familyId, familyData);
      }
    });
    
    return Array.from(families.values()).sort((a, b) => a.lowestDexNumber - b.lowestDexNumber);
  }

  /**
   * Get evolution chain for a specific Pokemon
   */
  getEvolutionChain(pokemonId) {
    const familyData = this.getFamily(pokemonId);
    if (!familyData) return [];
    
    const tree = familyData.tree;
    const chain = [];
    
    // Build linear evolution chain
    if (tree.base.length > 0) chain.push(...tree.base);
    if (tree.stage1.length > 0) chain.push(...tree.stage1);
    if (tree.stage2.length > 0) chain.push(...tree.stage2);
    
    return chain;
  }

  /**
   * Get all variants of a Pokemon (normal, shadow, mega, regional)
   */
  getAllVariants(pokemonId) {
    const familyData = this.getFamily(pokemonId);
    if (!familyData) return [];
    
    const baseName = this.getBaseName(pokemonId);
    
    return familyData.family.filter(pokemon => 
      this.getBaseName(pokemon.speciesId) === baseName
    );
  }

  /**
   * Get base name without variant suffixes
   */
  getBaseName(pokemonId) {
    return pokemonId
      .replace(/_shadow$/, '')
      .replace(/_mega.*$/, '')
      .replace(/_alolan$/, '')
      .replace(/_galarian$/, '')
      .replace(/_hisuian$/, '');
  }

  /**
   * Check if Pokemon is a base evolution
   */
  isBaseEvolution(pokemonId) {
    const familyData = this.getFamily(pokemonId);
    if (!familyData) return true;
    
    const pokemon = familyData.family.find(p => p.speciesId === pokemonId);
    return pokemon && !pokemon.family.parent;
  }

  /**
   * Check if Pokemon can evolve further
   */
  canEvolve(pokemonId) {
    const familyData = this.getFamily(pokemonId);
    if (!familyData) return false;
    
    const pokemon = familyData.family.find(p => p.speciesId === pokemonId);
    return pokemon && pokemon.family.evolutions && pokemon.family.evolutions.length > 0;
  }

  /**
   * Get evolution requirements/costs
   */
  getEvolutionRequirements(pokemonId) {
    const familyData = this.getFamily(pokemonId);
    if (!familyData) return null;
    
    const pokemon = familyData.family.find(p => p.speciesId === pokemonId);
    if (!pokemon || !pokemon.family.evolutions) return null;
    
    // This would need additional data from the gamemaster
    // For now, return basic info
    return {
      canEvolve: pokemon.family.evolutions.length > 0,
      evolutions: pokemon.family.evolutions,
      candyCost: pokemon.candyToEvolve || 25, // Default candy cost
      buddyDistance: pokemon.buddyDistance || 3
    };
  }

  /**
   * Sort Pokemon by evolution family
   */
  sortByEvolutionFamily(pokemonList) {
    return pokemonList.sort((a, b) => {
      const familyA = this.getFamily(a.speciesId);
      const familyB = this.getFamily(b.speciesId);
      
      if (!familyA && !familyB) return 0;
      if (!familyA) return 1;
      if (!familyB) return -1;
      
      // First sort by family (lowest dex number in family)
      if (familyA.lowestDexNumber !== familyB.lowestDexNumber) {
        return familyA.lowestDexNumber - familyB.lowestDexNumber;
      }
      
      // Then sort within family by dex number
      return (a.dex || 999) - (b.dex || 999);
    });
  }

  /**
   * Get family statistics
   */
  getFamilyStats(familyId) {
    const familyData = Array.from(this.familyCache.values()).find(f => f.familyId === familyId);
    if (!familyData) return null;
    
    const family = familyData.family;
    
    return {
      familyId,
      totalMembers: family.length,
      baseEvolutions: familyData.tree.base.length,
      stage1Evolutions: familyData.tree.stage1.length,
      stage2Evolutions: familyData.tree.stage2.length,
      megaEvolutions: familyData.tree.mega.length,
      shadowVariants: familyData.tree.shadow.length,
      regionalVariants: familyData.tree.regional.length,
      lowestDexNumber: familyData.lowestDexNumber,
      highestDexNumber: Math.max(...family.map(p => p.dex || 0))
    };
  }

  /**
   * Get compact family display info
   */
  getFamilyDisplayInfo(pokemonId) {
    const familyData = this.getFamily(pokemonId);
    if (!familyData) return null;
    
    const chain = this.getEvolutionChain(pokemonId);
    const variants = this.getAllVariants(pokemonId);
    
    return {
      familyId: familyData.familyId,
      evolutionStage: this.getEvolutionStage(pokemonId),
      totalInChain: chain.length,
      totalVariants: variants.length,
      canEvolve: this.canEvolve(pokemonId),
      isBase: this.isBaseEvolution(pokemonId)
    };
  }

  /**
   * Get evolution stage number
   */
  getEvolutionStage(pokemonId) {
    const familyData = this.getFamily(pokemonId);
    if (!familyData) return 0;
    
    const pokemon = familyData.family.find(p => p.speciesId === pokemonId);
    if (!pokemon) return 0;
    
    if (!pokemon.family.parent) return 0; // Base
    if (pokemon.family.evolutions && pokemon.family.evolutions.length > 0) return 1; // Stage 1
    return 2; // Stage 2
  }
}

export default new EvolutionFamilyService(); 