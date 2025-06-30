import React, { useState, useEffect, useMemo } from 'react';
import { Download } from 'lucide-react';
import { useData } from '../context/DataContext';
import battleCalculationService from '../services/battleCalculationService';
import evolutionFamilyService from '../services/evolutionFamilyService';
import TypeIcon from './TypeIcon';
import TierBadge from './TierBadge';
import Tooltip from './Tooltip';
import ColumnManager from './ColumnManager';
import LoadingSpinner from './LoadingSpinner';
import MoveDetailsModal from './MoveDetailsModal';

const PokemonAnalysisTable = () => {
  const { allPokemon, rankings, allMoves, isLoading } = useData();
  const [sortBy, setSortBy] = useState('dex');
  const [sortOrder, setSortOrder] = useState('asc');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [selectedLeague, setSelectedLeague] = useState('great');
  const [visibleColumns, setVisibleColumns] = useState({
    pokemon: true,
    types: true,
    stats: true,
    pvpRank: true,
    pvpMoveset: true,
    raidTier: true,
    raidMoveset: true,
    evolutionInfo: true
  });
  const [processedData, setProcessedData] = useState([]);
  const [expandedRows, setExpandedRows] = useState(new Set());

  // Available columns configuration
  const columnConfig = [
    { key: 'pokemon', label: 'Pokemon', description: 'Pokemon name and number' },
    { key: 'types', label: 'Types', description: 'Pokemon types with effectiveness' },
    { key: 'stats', label: 'Stats', description: 'Base stats (Atk/Def/HP)' },
    { key: 'pvpRank', label: 'PVP Rank', description: 'League ranking position' },
    { key: 'pvpMoveset', label: 'PVP Moveset', description: 'Best PVP moveset' },
    { key: 'raidTier', label: 'Raid Tier', description: 'Raid performance tier vs types' },
    { key: 'raidMoveset', label: 'Raid Moveset', description: 'Best raid moveset' },
    { key: 'evolutionInfo', label: 'Evolution', description: 'Evolution family info' }
  ];

  // Sort options
  const sortOptions = [
    { value: 'dex', label: 'Pokedex Number' },
    { value: 'evolutionFamily', label: 'Evolution Family' },
    { value: 'name', label: 'Name' },
    { value: 'type', label: 'Primary Type' },
    { value: 'pvpRank', label: 'PVP Ranking' },
    { value: 'raidTier', label: 'Raid Tier' },
    { value: 'stats', label: 'Base Stats Total' }
  ];

  // Pokemon types for filtering
  const pokemonTypes = [
    'normal', 'fire', 'water', 'electric', 'grass', 'ice', 'fighting', 'poison',
    'ground', 'flying', 'psychic', 'bug', 'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'
  ];

  // Process Pokemon data with all analysis
  useEffect(() => {
    if (!allPokemon?.length || !rankings || !allMoves?.length) return;

    console.log('🔄 Processing Pokemon analysis data...');
    
    // Build evolution families
    evolutionFamilyService.buildEvolutionFamilies(allPokemon);
    
    const processed = allPokemon.map(pokemon => {
      // Get Pokemon moves
      const moves = battleCalculationService.getPokemonMoves(pokemon, allMoves);
      
      // Get PVP ranking for selected league
      const leagueRankings = rankings.leagues?.[selectedLeague]?.overall || [];
      const pvpRank = leagueRankings.findIndex(p => p.speciesId === pokemon.speciesId) + 1 || null;
      const pvpData = leagueRankings.find(p => p.speciesId === pokemon.speciesId);
      
      // Get raid analysis
      const raidAnalysis = battleCalculationService.getRaidAnalysis(pokemon, moves);
      
      // Get evolution family info
      const familyInfo = evolutionFamilyService.getFamilyDisplayInfo(pokemon.speciesId);
      
      // Calculate base stat total
      const baseStatTotal = (pokemon.baseStats?.atk || 0) + 
                           (pokemon.baseStats?.def || 0) + 
                           (pokemon.baseStats?.hp || 0);

      return {
        ...pokemon,
        moves,
        pvpRank,
        pvpData,
        raidAnalysis,
        familyInfo,
        baseStatTotal,
        // Add searchable text
        searchText: `${pokemon.speciesName} ${pokemon.speciesId} ${pokemon.types?.join(' ')}`.toLowerCase()
      };
    });
    
    setProcessedData(processed);
    console.log(`✅ Processed ${processed.length} Pokemon with comprehensive analysis`);
  }, [allPokemon, rankings, allMoves, selectedLeague]);

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    if (!processedData.length) return [];

    let filtered = processedData;

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(pokemon => pokemon.searchText.includes(term));
    }

    // Apply type filter
    if (selectedTypes.length > 0) {
      filtered = filtered.filter(pokemon => 
        selectedTypes.some(type => pokemon.types?.includes(type))
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'dex':
          comparison = (a.dex || 999) - (b.dex || 999);
          break;
        
        case 'evolutionFamily':
          return evolutionFamilyService.sortByEvolutionFamily([a, b])[0] === a ? -1 : 1;
        
        case 'name':
          comparison = a.speciesName.localeCompare(b.speciesName);
          break;
        
        case 'type':
          comparison = (a.types?.[0] || '').localeCompare(b.types?.[0] || '');
          break;
        
        case 'pvpRank':
          const rankA = a.pvpRank || 9999;
          const rankB = b.pvpRank || 9999;
          comparison = rankA - rankB;
          break;
        
        case 'raidTier':
          const tierValues = { 'S': 5, 'A': 4, 'B': 3, 'C': 2, 'D': 1, 'F': 0 };
          const tierA = tierValues[a.raidAnalysis?.overall?.tier] || 0;
          const tierB = tierValues[b.raidAnalysis?.overall?.tier] || 0;
          comparison = tierB - tierA; // Descending by default for tiers
          break;
        
        case 'stats':
          comparison = b.baseStatTotal - a.baseStatTotal; // Descending by default
          break;
        
        default:
          comparison = 0;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [processedData, searchTerm, selectedTypes, sortBy, sortOrder]);

  // Handle sort change
  const handleSort = (newSortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('asc');
    }
  };

  // Export to CSV
  const exportToCSV = () => {
    if (filteredAndSortedData.length === 0) {
      alert('No data to export');
      return;
    }

    // Create CSV headers based on visible columns
    const headers = [];
    if (visibleColumns.pokemon) headers.push('Dex', 'Pokemon', 'Species ID');
    if (visibleColumns.types) headers.push('Type 1', 'Type 2');
    if (visibleColumns.stats) headers.push('Attack', 'Defense', 'HP', 'BST');
    if (visibleColumns.pvpRank) headers.push(`${selectedLeague.charAt(0).toUpperCase() + selectedLeague.slice(1)} Rank`, 'PVP Score');
    if (visibleColumns.pvpMoveset) headers.push('PVP Fast Move', 'PVP Charged Move 1', 'PVP Charged Move 2');
    if (visibleColumns.raidTier) headers.push('Raid Tier', 'Best Raid Type');
    if (visibleColumns.raidMoveset) headers.push('Raid Fast Move', 'Raid Charged Move');
    if (visibleColumns.evolutionInfo) headers.push('Evolution Stage', 'Family');

    // Create CSV rows
    const rows = filteredAndSortedData.map(pokemon => {
      const row = [];
      
      if (visibleColumns.pokemon) {
        row.push(pokemon.dex || '', `"${pokemon.speciesName}"`, pokemon.speciesId);
      }
      
      if (visibleColumns.types) {
        row.push(pokemon.types?.[0] || '', pokemon.types?.[1] || '');
      }
      
      if (visibleColumns.stats) {
        row.push(
          pokemon.baseStats?.atk || '',
          pokemon.baseStats?.def || '',
          pokemon.baseStats?.hp || '',
          pokemon.baseStatTotal || ''
        );
      }
      
      if (visibleColumns.pvpRank) {
        row.push(pokemon.pvpRank || '', pokemon.pvpData?.score || '');
      }
      
      if (visibleColumns.pvpMoveset) {
        const pvpMoves = pokemon.moves?.pvp || {};
        row.push(
          pvpMoves.fastMove || '',
          pvpMoves.chargedMoves?.[0] || '',
          pvpMoves.chargedMoves?.[1] || ''
        );
      }
      
      if (visibleColumns.raidTier) {
        row.push(
          pokemon.raidAnalysis?.overall?.tier || 'F',
          pokemon.raidAnalysis?.overall?.bestType || ''
        );
      }
      
      if (visibleColumns.raidMoveset) {
        const raidMoves = pokemon.moves?.raid || {};
        row.push(raidMoves.fastMove || '', raidMoves.chargedMove || '');
      }
      
      if (visibleColumns.evolutionInfo) {
        row.push(
          pokemon.familyInfo?.stage || '',
          pokemon.familyInfo?.familyName || ''
        );
      }
      
      return row.join(',');
    });

    // Create and download CSV
    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `pokemon-analysis-${selectedLeague}-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    console.log(`📊 Exported ${filteredAndSortedData.length} Pokemon to CSV`);
  };

  // Toggle row expansion
  const toggleRowExpansion = (pokemonId) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(pokemonId)) {
      newExpanded.delete(pokemonId);
    } else {
      newExpanded.add(pokemonId);
    }
    setExpandedRows(newExpanded);
  };

  // Format PVP moveset display
  const formatPVPMoveset = (pokemon) => {
    if (!pokemon.pvpData?.moveset) return 'N/A';
    
    const { fastMove, chargedMoves } = pokemon.pvpData.moveset;
    const chargedDisplay = chargedMoves ? chargedMoves.slice(0, 2).join(' / ') : '';
    
    return (
      <div className="moveset-display">
        <div className="fast-move">{fastMove}</div>
        <div className="charged-moves">{chargedDisplay}</div>
      </div>
    );
  };

  // Format raid tier display with type breakdown
  const formatRaidTier = (raidAnalysis) => {
    if (!raidAnalysis?.overall) return <TierBadge tier="F" />;
    
    const { tier, bestType } = raidAnalysis.overall;
    
    return (
      <div className="raid-tier-display">
        <TierBadge tier={tier} />
        {bestType && (
          <Tooltip content={`Best vs ${bestType.charAt(0).toUpperCase() + bestType.slice(1)}`}>
            <TypeIcon type={bestType} size="small" />
          </Tooltip>
        )}
      </div>
    );
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading comprehensive Pokemon analysis..." />;
  }

  return (
    <div className="pokemon-analysis-table">
      {/* Controls */}
      <div className="table-controls">
        <div className="search-and-filters">
          <input
            type="text"
            placeholder="Search Pokemon..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          
          <select
            value={selectedLeague}
            onChange={(e) => setSelectedLeague(e.target.value)}
            className="league-select"
          >
            <option value="great">Great League</option>
            <option value="ultra">Ultra League</option>
            <option value="master">Master League</option>
          </select>
        </div>

        <div className="sort-controls">
          <select
            value={sortBy}
            onChange={(e) => handleSort(e.target.value)}
            className="sort-select"
          >
            {sortOptions.map(option => (
              <option key={option.value} value={option.value}>
                Sort by {option.label}
              </option>
            ))}
          </select>
          
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="sort-order-btn"
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>

        <div className="action-controls">
          <button
            onClick={exportToCSV}
            className="export-btn"
            title="Export filtered data to CSV"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </button>
          
          <ColumnManager
            columns={columnConfig}
            visibleColumns={visibleColumns}
            onColumnToggle={setVisibleColumns}
          />
        </div>
      </div>

      {/* Type filter chips */}
      <div className="type-filters">
        {pokemonTypes.map(type => (
          <button
            key={type}
            onClick={() => {
              if (selectedTypes.includes(type)) {
                setSelectedTypes(selectedTypes.filter(t => t !== type));
              } else {
                setSelectedTypes([...selectedTypes, type]);
              }
            }}
            className={`type-filter-chip ${selectedTypes.includes(type) ? 'active' : ''}`}
          >
            <TypeIcon type={type} size="small" />
            {type}
          </button>
        ))}
        {selectedTypes.length > 0 && (
          <button
            onClick={() => setSelectedTypes([])}
            className="clear-filters-btn"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Results count */}
      <div className="results-info">
        Showing {filteredAndSortedData.length} of {processedData.length} Pokemon
      </div>

      {/* Main table */}
      <div className="table-container">
        <table className="analysis-table">
          <thead>
            <tr>
              <th></th> {/* Expand/collapse column */}
              {visibleColumns.pokemon && (
                <th onClick={() => handleSort('dex')} className="sortable">
                  Pokemon {sortBy === 'dex' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
              )}
              {visibleColumns.types && <th>Types</th>}
              {visibleColumns.stats && (
                <th onClick={() => handleSort('stats')} className="sortable">
                  Stats {sortBy === 'stats' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
              )}
              {visibleColumns.pvpRank && (
                <th onClick={() => handleSort('pvpRank')} className="sortable">
                  {selectedLeague.charAt(0).toUpperCase() + selectedLeague.slice(1)} League
                  {sortBy === 'pvpRank' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
              )}
              {visibleColumns.pvpMoveset && <th>PVP Moveset</th>}
              {visibleColumns.raidTier && (
                <th onClick={() => handleSort('raidTier')} className="sortable">
                  Raid Tier {sortBy === 'raidTier' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
              )}
              {visibleColumns.raidMoveset && <th>Best Raid Moveset</th>}
              {visibleColumns.evolutionInfo && <th>Evolution</th>}
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedData.map(pokemon => (
              <React.Fragment key={pokemon.speciesId}>
                <tr className="pokemon-row">
                  <td>
                    <button
                      onClick={() => toggleRowExpansion(pokemon.speciesId)}
                      className="expand-btn"
                    >
                      {expandedRows.has(pokemon.speciesId) ? '▼' : '▶'}
                    </button>
                  </td>
                  
                  {visibleColumns.pokemon && (
                    <td className="pokemon-cell">
                      <div className="pokemon-info">
                        <span className="dex-number">#{pokemon.dex}</span>
                        <Tooltip content={`${pokemon.speciesName}\nID: ${pokemon.speciesId}`}>
                          <span className="pokemon-name">{pokemon.speciesName}</span>
                        </Tooltip>
                      </div>
                    </td>
                  )}
                  
                  {visibleColumns.types && (
                    <td className="types-cell">
                      {pokemon.types?.map(type => (
                        <TypeIcon key={type} type={type} size="medium" />
                      ))}
                    </td>
                  )}
                  
                  {visibleColumns.stats && (
                    <td className="stats-cell">
                      <Tooltip content={`Attack: ${pokemon.baseStats?.atk}\nDefense: ${pokemon.baseStats?.def}\nHP: ${pokemon.baseStats?.hp}\nTotal: ${pokemon.baseStatTotal}`}>
                        <div className="stat-total">{pokemon.baseStatTotal}</div>
                      </Tooltip>
                    </td>
                  )}
                  
                  {visibleColumns.pvpRank && (
                    <td className="pvp-rank-cell">
                      {pokemon.pvpRank ? (
                        <Tooltip content={`Rank ${pokemon.pvpRank} in ${selectedLeague} league`}>
                          <span className={`rank ${pokemon.pvpRank <= 10 ? 'top-tier' : pokemon.pvpRank <= 50 ? 'high-tier' : ''}`}>
                            #{pokemon.pvpRank}
                          </span>
                        </Tooltip>
                      ) : (
                        <span className="no-rank">-</span>
                      )}
                    </td>
                  )}
                  
                  {visibleColumns.pvpMoveset && (
                    <td className="pvp-moveset-cell">
                      {formatPVPMoveset(pokemon)}
                    </td>
                  )}
                  
                  {visibleColumns.raidTier && (
                    <td className="raid-tier-cell">
                      {formatRaidTier(pokemon.raidAnalysis)}
                    </td>
                  )}
                  
                  {visibleColumns.raidMoveset && (
                    <td className="raid-moveset-cell">
                      {pokemon.raidAnalysis?.overall?.bestType && (
                        <div className="best-raid-moveset">
                          <div className="vs-type">vs <TypeIcon type={pokemon.raidAnalysis.overall.bestType} size="small" /></div>
                          <div className="dps">DPS: {pokemon.raidAnalysis[pokemon.raidAnalysis.overall.bestType]?.dps?.toFixed(1)}</div>
                        </div>
                      )}
                    </td>
                  )}
                  
                  {visibleColumns.evolutionInfo && (
                    <td className="evolution-cell">
                      {pokemon.familyInfo && (
                        <Tooltip content={`Evolution Stage: ${pokemon.familyInfo.evolutionStage}\nCan Evolve: ${pokemon.familyInfo.canEvolve ? 'Yes' : 'No'}\nFamily Size: ${pokemon.familyInfo.totalVariants}`}>
                          <div className="evolution-info">
                            <span className="evolution-stage">Stage {pokemon.familyInfo.evolutionStage}</span>
                            {pokemon.familyInfo.canEvolve && <span className="can-evolve">⚡</span>}
                          </div>
                        </Tooltip>
                      )}
                    </td>
                  )}
                </tr>
                
                {/* Expanded row content */}
                {expandedRows.has(pokemon.speciesId) && (
                  <tr className="expanded-row">
                    <td colSpan={Object.values(visibleColumns).filter(Boolean).length + 1}>
                      <div className="expanded-content">
                        <div className="detailed-analysis">
                          {/* Detailed raid analysis by type */}
                          <div className="raid-analysis-section">
                            <h4>Raid Performance by Type</h4>
                            <div className="type-analysis-grid">
                              {pokemon.raidAnalysis && Object.entries(pokemon.raidAnalysis)
                                .filter(([type]) => type !== 'overall')
                                .slice(0, 8) // Show top 8 types
                                .map(([type, analysis]) => (
                                  <div key={type} className="type-analysis-item">
                                    <TypeIcon type={type} size="small" />
                                    <TierBadge tier={analysis.tier} />
                                    <span className="dps-value">{analysis.dps?.toFixed(1)} DPS</span>
                                  </div>
                                ))
                              }
                            </div>
                          </div>
                          
                          {/* Available moves */}
                          <div className="moves-section">
                            <h4>Available Moves</h4>
                            <div className="moves-display">
                              <div className="fast-moves">
                                <strong>Fast:</strong> {pokemon.moves?.fastMoves?.map(m => m.name || m.moveId).join(', ') || 'None'}
                              </div>
                              <div className="charged-moves">
                                <strong>Charged:</strong> {pokemon.moves?.chargedMoves?.map(m => m.name || m.moveId).join(', ') || 'None'}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PokemonAnalysisTable; 