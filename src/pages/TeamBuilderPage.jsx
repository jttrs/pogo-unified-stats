import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { Plus, X, Save, Trash2, Users, Trophy, Zap, Shield } from 'lucide-react';
import EnhancedSearchBar from '../components/EnhancedSearchBar';
import TypeIcon from '../components/TypeIcon';
import TierBadge from '../components/TierBadge';

const TeamBuilderPage = () => {
  const { data, allPokemon, rankings, loading } = useData();
  const [selectedLeague, setSelectedLeague] = useState('cp1500');
  const [currentTeam, setCurrentTeam] = useState([null, null, null]);
  const [savedTeams, setSavedTeams] = useState([]);
  const [teamName, setTeamName] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSlot, setActiveSlot] = useState(null);

  const leagues = [
    { value: 'cp1500', label: 'Great League (1500 CP)', cp: 1500 },
    { value: 'cp2500', label: 'Ultra League (2500 CP)', cp: 2500 },
    { value: 'cp10000', label: 'Master League', cp: 10000 }
  ];

  // Load saved teams from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('pvp-teams');
    if (saved) {
      try {
        setSavedTeams(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading saved teams:', error);
      }
    }
  }, []);

  // Save teams to localStorage whenever savedTeams changes
  useEffect(() => {
    localStorage.setItem('pvp-teams', JSON.stringify(savedTeams));
  }, [savedTeams]);



  // Add Pokemon to team
  const addPokemonToTeam = (pokemon, slotIndex) => {
    const newTeam = [...currentTeam];
    newTeam[slotIndex] = {
      ...pokemon,
      league: selectedLeague,
      addedAt: Date.now()
    };
    setCurrentTeam(newTeam);
    setActiveSlot(null);
    setShowSuggestions(false);
  };

  // Remove Pokemon from team
  const removePokemonFromTeam = (slotIndex) => {
    const newTeam = [...currentTeam];
    newTeam[slotIndex] = null;
    setCurrentTeam(newTeam);
  };

  // Save current team
  const saveCurrentTeam = () => {
    if (!teamName.trim()) {
      alert('Please enter a team name');
      return;
    }

    const team = {
      id: Date.now(),
      name: teamName,
      league: selectedLeague,
      pokemon: currentTeam.filter(p => p !== null),
      createdAt: new Date().toISOString(),
      analysis: analyzeTeam(currentTeam.filter(p => p !== null))
    };

    setSavedTeams([...savedTeams, team]);
    setTeamName('');
    alert('Team saved successfully!');
  };

  // Load saved team
  const loadTeam = (team) => {
    setCurrentTeam([...team.pokemon, null, null, null].slice(0, 3));
    setSelectedLeague(team.league);
    setTeamName(team.name);
  };

  // Delete saved team
  const deleteTeam = (teamId) => {
    if (confirm('Are you sure you want to delete this team?')) {
      setSavedTeams(savedTeams.filter(t => t.id !== teamId));
    }
  };

  // Analyze team composition
  const analyzeTeam = (teamPokemon) => {
    if (teamPokemon.length === 0) return null;

    const types = [];
    let totalScore = 0;
    let averageRank = 0;

    teamPokemon.forEach(pokemon => {
      if (pokemon['Type 1']) types.push(pokemon['Type 1'].toLowerCase());
      if (pokemon['Type 2'] && pokemon['Type 2'] !== 'none') {
        types.push(pokemon['Type 2'].toLowerCase());
      }
      totalScore += parseFloat(pokemon.Score || 0);
      averageRank += parseInt(pokemon.rank || 999);
    });

    const uniqueTypes = [...new Set(types)];
    const typeDistribution = {};
    types.forEach(type => {
      typeDistribution[type] = (typeDistribution[type] || 0) + 1;
    });

    return {
      totalScore: totalScore.toFixed(1),
      averageScore: (totalScore / teamPokemon.length).toFixed(1),
      averageRank: Math.round(averageRank / teamPokemon.length),
      uniqueTypes: uniqueTypes.length,
      typeDistribution,
      teamSize: teamPokemon.length
    };
  };

  const currentTeamAnalysis = analyzeTeam(currentTeam.filter(p => p !== null));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Pokemon data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center mb-4">
          <Users className="w-8 h-8 text-blue-600 mr-3" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Team Builder</h1>
            <p className="text-gray-600">Build and analyze your PVP teams</p>
          </div>
        </div>

        {/* League Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">League</label>
          <select
            value={selectedLeague}
            onChange={(e) => setSelectedLeague(e.target.value)}
            className="w-full md:w-auto border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {leagues.map(league => (
              <option key={league.value} value={league.value}>
                {league.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Current Team */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Your Team</h2>
        
        {/* Team Slots */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {currentTeam.map((pokemon, index) => (
            <div key={index} className="border-2 border-dashed border-gray-300 rounded-lg p-4 min-h-48">
              {pokemon ? (
                <div className="relative">
                  <button
                    onClick={() => removePokemonFromTeam(index)}
                    className="absolute top-0 right-0 text-red-500 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg">{pokemon.Pokemon}</h3>
                    <div className="flex space-x-1">
                      <TypeIcon type={pokemon['Type 1']} />
                      {pokemon['Type 2'] && pokemon['Type 2'] !== 'none' && (
                        <TypeIcon type={pokemon['Type 2']} />
                      )}
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>Rank: #{pokemon.rank || 'N/A'}</p>
                      <p>Score: {parseFloat(pokemon.Score || 0).toFixed(1)}</p>
                      <p>CP: {pokemon.CP || 'N/A'}</p>
                    </div>
                    <div className="text-xs text-gray-500">
                      <p>Fast: {pokemon['Fast Move'] || 'N/A'}</p>
                      <p>Charged: {pokemon['Charged Move 1'] || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div 
                  className="flex flex-col items-center justify-center h-full text-gray-500 cursor-pointer hover:bg-gray-50"
                  onClick={() => {
                    setActiveSlot(index);
                    setShowSuggestions(true);
                  }}
                >
                  <Plus className="w-8 h-8 mb-2" />
                  <p className="text-sm">Add Pokemon</p>
                  <p className="text-xs">Slot {index + 1}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Search and Add Pokemon */}
        {showSuggestions && activeSlot !== null && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Add Pokemon to Slot {activeSlot + 1}</h3>
              <button
                onClick={() => {
                  setShowSuggestions(false);
                  setActiveSlot(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <EnhancedSearchBar
              onSelect={(pokemon) => {
                // Convert to expected format
                const formattedPokemon = {
                  Pokemon: pokemon.speciesName || pokemon.name,
                  speciesId: pokemon.speciesId,
                  'Type 1': pokemon.types?.[0] || 'Normal',
                  'Type 2': pokemon.types?.[1] || 'none',
                  Attack: pokemon.baseStats?.atk || 100,
                  Defense: pokemon.baseStats?.def || 100,
                  Stamina: pokemon.baseStats?.hp || 100,
                  Score: pokemon.ranking?.Score || 0,
                  rank: pokemon.ranking?.rank || 999,
                  CP: pokemon.ranking?.CP || '???',
                  'Fast Move': pokemon.ranking?.['Fast Move'] || 'Unknown',
                  'Charged Move 1': pokemon.ranking?.['Charged Move 1'] || 'Unknown',
                  'Charged Move 2': pokemon.ranking?.['Charged Move 2'] || ''
                };
                addPokemonToTeam(formattedPokemon, activeSlot);
              }}
              placeholder={`Search Pokemon for Slot ${activeSlot + 1}...`}
              maxResults={15}
              className="mb-3"
            />
          </div>
        )}

        {/* Team Analysis */}
        {currentTeamAnalysis && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold mb-3">Team Analysis</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{currentTeamAnalysis.averageScore}</div>
                <div className="text-sm text-gray-600">Avg Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">#{currentTeamAnalysis.averageRank}</div>
                <div className="text-sm text-gray-600">Avg Rank</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{currentTeamAnalysis.uniqueTypes}</div>
                <div className="text-sm text-gray-600">Unique Types</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{currentTeamAnalysis.teamSize}/3</div>
                <div className="text-sm text-gray-600">Team Size</div>
              </div>
            </div>
          </div>
        )}

        {/* Save Team */}
        <div className="flex items-center space-x-4">
          <input
            type="text"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            placeholder="Enter team name..."
            className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={saveCurrentTeam}
            disabled={currentTeam.filter(p => p !== null).length === 0 || !teamName.trim()}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Team
          </button>
        </div>
      </div>

      {/* Saved Teams */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Saved Teams ({savedTeams.length})
        </h2>
        
        {savedTeams.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No saved teams yet. Build your first team above!</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedTeams.map(team => (
              <div key={team.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-lg">{team.name}</h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => loadTeam(team)}
                      className="text-blue-600 hover:text-blue-800"
                      title="Load team"
                    >
                      <Users className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteTeam(team.id)}
                      className="text-red-600 hover:text-red-800"
                      title="Delete team"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="text-sm text-gray-600 mb-3">
                  <p>{leagues.find(l => l.value === team.league)?.label}</p>
                  <p>{team.pokemon.length} Pokemon</p>
                  <p>Created: {new Date(team.createdAt).toLocaleDateString()}</p>
                </div>
                
                <div className="space-y-2">
                  {team.pokemon.map((pokemon, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span className="truncate">{pokemon.Pokemon}</span>
                      <span className="text-gray-500">#{pokemon.rank}</span>
                    </div>
                  ))}
                </div>
                
                {team.analysis && (
                  <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-600">
                    <div className="flex justify-between">
                      <span>Avg Score: {team.analysis.averageScore}</span>
                      <span>Types: {team.analysis.uniqueTypes}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamBuilderPage; 