import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Home, BarChart3, Trophy, GitCompare, Users, RefreshCw, ExternalLink, AlertCircle } from 'lucide-react'
import { useData } from '../context/DataContext'

const Header = () => {
  const location = useLocation()
  const { loading, data, error, refreshData } = useData()

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/rankings', label: 'Rankings', icon: BarChart3 },
    { path: '/tier-rankings', label: 'Tier Rankings', icon: Trophy },
    { path: '/compare', label: 'Compare', icon: GitCompare },
    { path: '/team-builder', label: 'Team Builder', icon: Users },
    { path: '/comprehensive', label: 'Analysis', icon: AlertCircle }
  ]

  const formatLastUpdated = (date) => {
    if (!date) return 'Never'
    const now = new Date()
    const lastUpdate = new Date(date)
    const diff = now - lastUpdate
    const minutes = Math.floor(diff / 60000)
    
    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    
    const days = Math.floor(hours / 24)
    return `${days}d ago`
  }

  const handleRefresh = async () => {
    if (!loading) {
      await refreshData()
    }
  }

  const hasData = data && !error
  const lastUpdated = hasData ? data.lastUpdated : null

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Title */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-br from-pogo-blue to-pogo-yellow rounded-full flex items-center justify-center mr-3">
                <span className="text-white font-bold text-lg">PU</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Pokemon GO</h1>
                <p className="text-sm text-gray-600">Unified Stats</p>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-pogo-blue text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          {/* Data Status and Refresh */}
          <div className="flex items-center space-x-4">
            {/* Data Sources */}
            <div className="hidden lg:flex items-center space-x-2 text-xs text-gray-500">
              <div className="flex items-center">
                <span>Data from:</span>
                <a 
                  href="https://pvpoke.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="ml-1 text-pogo-blue hover:underline flex items-center"
                >
                  PVPoke
                  <ExternalLink className="w-3 h-3 ml-1" />
                </a>
                <span className="mx-1">&</span>
                <a 
                  href="https://www.dialgadex.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-pogo-blue hover:underline flex items-center"
                >
                  DialgaDex
                  <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </div>
            </div>

            {/* Last Updated */}
            {hasData && (
              <div className="hidden md:flex flex-col items-end text-xs text-gray-500">
                <span>Last updated</span>
                <span className="font-medium">{formatLastUpdated(lastUpdated)}</span>
              </div>
            )}

            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={loading}
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                loading
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-pogo-green text-white hover:bg-green-600'
              }`}
              title="Refresh data from PVPoke and DialgaDex"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">
                {loading ? 'Updating...' : 'Refresh'}
              </span>
            </button>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button className="text-gray-700 hover:text-gray-900">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    isActive
                      ? 'bg-pogo-blue text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.label}
                </Link>
              )
            })}
            
            {/* Mobile Data Status */}
            {hasData && (
              <div className="px-3 py-2 text-xs text-gray-500">
                <div className="flex items-center justify-between">
                  <span>Last updated: {formatLastUpdated(lastUpdated)}</span>
                  <div className="flex items-center space-x-1">
                    <a 
                      href="https://pvpoke.com" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-pogo-blue hover:underline"
                    >
                      PVPoke
                    </a>
                    <span>&</span>
                    <a 
                      href="https://www.dialgadex.com" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-pogo-blue hover:underline"
                    >
                      DialgaDex
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Loading Indicator */}
      {loading && (
        <div className="bg-pogo-blue text-white px-4 py-2 text-center text-sm">
          <div className="flex items-center justify-center">
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            Attempting to fetch data from PVPoke API...
          </div>
        </div>
      )}
      
      {/* Error Indicator */}
      {error && !loading && (
        <div className="bg-red-600 text-white px-4 py-2 text-center text-sm">
          <div className="flex items-center justify-center">
            <AlertCircle className="w-4 h-4 mr-2" />
            Unable to load data from external sources
          </div>
        </div>
      )}
    </header>
  )
}

export default Header 