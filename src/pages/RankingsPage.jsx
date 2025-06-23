import React, { useState, useEffect } from 'react'
import { Filter, Download, AlertCircle } from 'lucide-react'
import PokemonCard from '../components/PokemonCard'
import SearchBar from '../components/SearchBar'
import { useData } from '../context/DataContext'

const RankingsPage = () => {
  const [selectedLeague, setSelectedLeague] = useState('cp1500')
  const [filteredPokemon, setFilteredPokemon] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('score')
  const [typeFilter, setTypeFilter] = useState('all')
  const { data, loading, error } = useData()

  const leagues = [
    { value: 'cp1500', label: 'Great League (1500 CP)' },
    { value: 'cp2500', label: 'Ultra League (2500 CP)' },
    { value: 'cp10000', label: 'Master League' },
    { value: 'premier', label: 'Premier Cup' }
  ]

  const types = [
    'all', 'normal', 'fire', 'water', 'grass', 'electric', 'ice',
    'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug',
    'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'
  ]

  useEffect(() => {
    if (!loading && data?.pvp?.[selectedLeague]) {
      let filtered = data.pvp[selectedLeague]

      // Apply search filter
      if (searchQuery) {
        filtered = filtered.filter(pokemon =>
          pokemon.Pokemon?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          pokemon.name?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      }

      // Apply type filter
      if (typeFilter !== 'all') {
        filtered = filtered.filter(pokemon =>
          pokemon['Type 1']?.toLowerCase() === typeFilter ||
          pokemon['Type 2']?.toLowerCase() === typeFilter
        )
      }

      // Apply sorting
      filtered = [...filtered].sort((a, b) => {
        switch (sortBy) {
          case 'score':
            return parseFloat(b.Score || b.score || 0) - parseFloat(a.Score || a.score || 0)
          case 'name':
            return (a.Pokemon || a.name || '').localeCompare(b.Pokemon || b.name || '')
          case 'attack':
            return parseFloat(b.Attack || b.attack || 0) - parseFloat(a.Attack || a.attack || 0)
          case 'defense':
            return parseFloat(b.Defense || b.defense || 0) - parseFloat(a.Defense || a.defense || 0)
          default:
            return 0
        }
      })

      setFilteredPokemon(filtered.slice(0, 100)) // Limit to top 100
    } else if (!loading && !data) {
      setFilteredPokemon([])
    }
  }, [selectedLeague, searchQuery, typeFilter, sortBy, data, loading])

  const handleSearch = (query) => {
    setSearchQuery(query)
  }

  const downloadCSV = () => {
    if (filteredPokemon.length === 0) return
    
    const headers = ['Rank', 'Pokemon', 'Score', 'Type 1', 'Type 2', 'Attack', 'Defense', 'Stamina', 'CP']
    const csvContent = [
      headers.join(','),
      ...filteredPokemon.map((pokemon, index) => [
        index + 1,
        `"${pokemon.Pokemon || pokemon.name}"`,
        pokemon.Score || pokemon.score,
        pokemon['Type 1'] || pokemon.types?.[0],
        pokemon['Type 2'] || pokemon.types?.[1] || '',
        pokemon.Attack || pokemon.attack,
        pokemon.Defense || pokemon.defense,
        pokemon.Stamina || pokemon.stamina,
        pokemon.CP || pokemon.cp
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `pokemon-rankings-${selectedLeague}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pogo-blue mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Pokemon rankings...</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Data Available</h2>
          <p className="text-gray-600 mb-4">
            {error || 'Unable to load Pokemon rankings. Please check your internet connection and try again.'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-pogo-blue text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  const currentLeagueData = data.pvp?.[selectedLeague]
  if (!currentLeagueData || currentLeagueData.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Rankings Available</h2>
          <p className="text-gray-600 mb-4">
            No ranking data available for {leagues.find(l => l.value === selectedLeague)?.label}.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Pokemon Rankings</h1>
            <p className="text-gray-600">Comprehensive PVP rankings across all leagues</p>
          </div>
          <button
            onClick={downloadCSV}
            className="flex items-center px-4 py-2 bg-pogo-blue text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <SearchBar onSearch={handleSearch} placeholder="Search Pokemon..." />
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">League</label>
            <select
              value={selectedLeague}
              onChange={(e) => setSelectedLeague(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pogo-blue"
            >
              {leagues.map(league => (
                <option key={league.value} value={league.value}>
                  {league.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pogo-blue"
            >
              {types.map(type => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pogo-blue"
            >
              <option value="score">Score</option>
              <option value="name">Name</option>
              <option value="attack">Attack</option>
              <option value="defense">Defense</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchQuery('')
                setTypeFilter('all')
                setSortBy('score')
              }}
              className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">
            {leagues.find(l => l.value === selectedLeague)?.label} Rankings
          </h2>
          <span className="text-gray-600">
            Showing {filteredPokemon.length} results
          </span>
        </div>

        {filteredPokemon.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPokemon.map((pokemon, index) => (
              <div key={index} className="relative">
                <div className="absolute top-2 left-2 bg-pogo-blue text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold z-10">
                  {index + 1}
                </div>
                <PokemonCard 
                  pokemon={{
                    name: pokemon.Pokemon || pokemon.name,
                    pvp: { [selectedLeague]: pokemon },
                    raid: null
                  }} 
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Filter className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Pokemon Found</h3>
            <p className="text-gray-600">Try adjusting your filters or search terms.</p>
          </div>
        )}
      </div>

      {/* League Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <div className="text-2xl font-bold text-pogo-blue mb-2">
            {filteredPokemon.length > 0 ? parseFloat(filteredPokemon[0].Score || filteredPokemon[0].score || 0).toFixed(1) : '0'}
          </div>
          <div className="text-gray-600">Top Score</div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <div className="text-2xl font-bold text-pogo-green mb-2">
            {new Set(filteredPokemon.map(p => p['Type 1'] || p.types?.[0])).size}
          </div>
          <div className="text-gray-600">Unique Types</div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <div className="text-2xl font-bold text-pogo-yellow mb-2">
            {filteredPokemon.filter(p => parseFloat(p.Score || p.score || 0) >= 80).length}
          </div>
          <div className="text-gray-600">Meta Relevant (80+)</div>
        </div>
      </div>
    </div>
  )
}

export default RankingsPage 