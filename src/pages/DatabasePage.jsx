import React, { useState } from 'react'
import { useData } from '../context/DataContext'
import { 
  Database, 
  RefreshCw, 
  Info, 
  Download, 
  CheckCircle, 
  AlertCircle,
  Trophy,
  Zap,
  Shield,
  Sword,
  TrendingUp
} from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'

const DatabasePage = () => {
  const { 
    database, 
    loading, 
    error, 
    refreshData, 
    getDatabaseStats,
    getPokemonByLeague,
    getTopPerformers,
    getAllMoves
  } = useData()
  
  const [refreshing, setRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await refreshData()
    } finally {
      setRefreshing(false)
    }
  }

  const databaseStats = getDatabaseStats()

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Database },
    { id: 'pokemon', label: 'Pokemon', icon: Trophy },
    { id: 'moves', label: 'Moves', icon: Zap },
    { id: 'rankings', label: 'Rankings', icon: TrendingUp }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
          <h2 className="text-2xl font-bold text-gray-900 mt-4">
            Building Comprehensive Pokemon Database
          </h2>
          <p className="text-gray-600 mt-2">
            Fetching data from PVPoke and PokeMiners...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Database className="w-8 h-8 text-pogo-blue" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Pokemon GO Database
                </h1>
                <p className="text-gray-600">
                  Comprehensive data from PVPoke and PokeMiners
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {error && (
                <div className="flex items-center text-red-600">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  <span className="text-sm">Error loading data</span>
                </div>
              )}
              
              {databaseStats && (
                <div className="flex items-center text-green-600">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  <span className="text-sm">Database loaded</span>
                </div>
              )}
              
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center px-4 py-2 bg-pogo-blue text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Refreshing...' : 'Refresh Data'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex space-x-1 bg-gray-200 p-1 rounded-lg mb-6">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors flex-1 justify-center ${
                  activeTab === tab.id
                    ? 'bg-white text-pogo-blue shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="font-medium">{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <OverviewTab 
            databaseStats={databaseStats} 
            error={error}
            database={database}
          />
        )}
        
        {activeTab === 'pokemon' && (
          <PokemonTab 
            getPokemonByLeague={getPokemonByLeague}
            getTopPerformers={getTopPerformers}
          />
        )}
        
        {activeTab === 'moves' && (
          <MovesTab getAllMoves={getAllMoves} />
        )}
        
        {activeTab === 'rankings' && (
          <RankingsTab database={database} />
        )}
      </div>
    </div>
  )
}

const OverviewTab = ({ databaseStats, error, database }) => {
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <AlertCircle className="w-8 h-8 text-red-600 mr-3" />
          <div>
            <h3 className="text-lg font-semibold text-red-900">Database Error</h3>
            <p className="text-red-700 mt-1">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  if (!databaseStats) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <p className="text-gray-600">No database statistics available</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <Trophy className="w-8 h-8 text-yellow-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Pokemon</p>
              <p className="text-2xl font-bold text-gray-900">
                {databaseStats.totalPokemon.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <Zap className="w-8 h-8 text-blue-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Moves</p>
              <p className="text-2xl font-bold text-gray-900">
                {databaseStats.totalMoves.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <Shield className="w-8 h-8 text-green-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Leagues</p>
              <p className="text-2xl font-bold text-gray-900">
                {databaseStats.totalLeagues}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <Database className="w-8 h-8 text-purple-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Data Sources</p>
              <p className="text-2xl font-bold text-gray-900">
                {databaseStats.metadata?.sources?.length || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Database Info */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center mb-4">
          <Info className="w-6 h-6 text-blue-500 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Database Information</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Data Sources</h4>
            <ul className="space-y-1">
              <li className="flex items-center text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                PVPoke.com (Rankings & Pokemon data)
              </li>
              <li className="flex items-center text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                PokeMiners (Game Master files)
              </li>
              <li className="flex items-center text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                PVPoke GitHub Repository
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-2">Last Updated</h4>
            <p className="text-sm text-gray-600">
              {new Date(databaseStats.lastUpdated).toLocaleString()}
            </p>

            <h4 className="font-medium text-gray-900 mb-2 mt-4">Database Created</h4>
            <p className="text-sm text-gray-600">
              {new Date(databaseStats.metadata?.createdAt || Date.now()).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* League Information */}
      {database?.rankings?.leagues && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">League Rankings</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(database.rankings.leagues).map(([leagueKey, league]) => (
              <div key={leagueKey} className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900">{league.name}</h4>
                <p className="text-sm text-gray-600">CP Limit: {league.cp}</p>
                <p className="text-sm text-gray-600">
                  Categories: {Object.keys(league.categories || {}).length}
                </p>
                <p className="text-sm text-gray-600">
                  Pokemon: {league.categories?.overall?.length || 0}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

const PokemonTab = ({ getPokemonByLeague, getTopPerformers }) => {
  const [selectedLeague, setSelectedLeague] = useState('great')
  
  const topPerformers = getTopPerformers(10)
  const leaguePokemon = getPokemonByLeague(selectedLeague, 20)

  return (
    <div className="space-y-6">
      {/* Top Performers */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performers (All Leagues)</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {topPerformers.map((pokemon, index) => (
            <div key={pokemon.speciesId} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">{pokemon.speciesName}</h4>
                <span className="text-sm font-bold text-pogo-blue">
                  #{index + 1}
                </span>
              </div>
              
              <div className="flex items-center space-x-2 mb-2">
                {pokemon.types?.map(type => (
                  <span 
                    key={type}
                    className={`px-2 py-1 rounded text-xs font-medium type-${type}`}
                  >
                    {type}
                  </span>
                ))}
              </div>
              
              <div className="text-sm text-gray-600">
                <p>Score: {pokemon.overallScore}</p>
                <p>Best League: {pokemon.bestLeague || 'N/A'}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* League Pokemon */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">League Rankings</h3>
          
          <select
            value={selectedLeague}
            onChange={(e) => setSelectedLeague(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="great">Great League (1500 CP)</option>
            <option value="ultra">Ultra League (2500 CP)</option>
            <option value="master">Master League</option>
          </select>
        </div>
        
        <div className="space-y-3">
          {leaguePokemon.map((pokemon) => (
            <div key={pokemon.speciesId} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-bold text-gray-600 w-8">
                  #{pokemon.rank}
                </span>
                
                <div>
                  <h4 className="font-medium text-gray-900">{pokemon.speciesName}</h4>
                  <div className="flex items-center space-x-2">
                    {pokemon.types?.map(type => (
                      <span 
                        key={type}
                        className={`px-2 py-1 rounded text-xs font-medium type-${type}`}
                      >
                        {type}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <p className="font-bold text-pogo-blue">{pokemon.score}</p>
                <p className="text-xs text-gray-500">Score</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const MovesTab = ({ getAllMoves }) => {
  const moves = getAllMoves()
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')

  const filteredMoves = moves.filter(move => {
    const matchesSearch = move.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          move.moveId.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === 'all' || move.type === typeFilter
    
    return matchesSearch && matchesType
  })

  const types = [...new Set(moves.map(move => move.type))].sort()

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Moves
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or move ID..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type Filter
            </label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="all">All Types</option>
              {types.map(type => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Moves List */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Moves ({filteredMoves.length})
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMoves.map((move) => (
            <div key={move.moveId} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">{move.name}</h4>
                <span className={`px-2 py-1 rounded text-xs font-medium type-${move.type}`}>
                  {move.type}
                </span>
              </div>
              
              <div className="text-sm text-gray-600 space-y-1">
                <p>Power: {move.power || 0}</p>
                <p>Energy: {move.energy || 0}</p>
                <p>Cooldown: {move.cooldown || 0}ms</p>
                {move.archetype && <p>Type: {move.archetype}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const RankingsTab = ({ database }) => {
  if (!database?.rankings?.leagues) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <p className="text-gray-600">No ranking data available</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {Object.entries(database.rankings.leagues).map(([leagueKey, league]) => (
        <div key={leagueKey} className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {league.name} (CP {league.cp})
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(league.categories || {}).map(([category, data]) => (
              <div key={category} className="border border-gray-200 rounded-lg p-3">
                <h4 className="font-medium text-gray-900 capitalize">{category}</h4>
                <p className="text-sm text-gray-600">
                  {Array.isArray(data) ? data.length : 0} Pokemon
                </p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default DatabasePage 