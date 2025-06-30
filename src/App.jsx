import React, { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import { DataProvider, useData } from './context/DataContext'
import Header from './components/Header'
import SearchBar from './components/SearchBar'
import PokemonCard from './components/PokemonCard'
import HomePage from './pages/HomePage'
import RankingsPage from './pages/RankingsPage'
import TierRankingsPage from './pages/TierRankingsPage'
import ComparisonPage from './pages/ComparisonPage'
import PokemonDetailsPage from './pages/PokemonDetailsPage'
import DatabasePage from './pages/DatabasePage'
import ComprehensiveAnalysisPage from './pages/ComprehensiveAnalysisPage'
import TeamBuilderPage from './pages/TeamBuilderPage'
import { TrendingUp, Zap, Target } from 'lucide-react'

// Error boundary component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-red-50 p-8">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold text-red-800 mb-4">Something went wrong</h1>
            <div className="bg-white p-4 rounded border border-red-200">
              <pre className="text-sm text-red-700 whitespace-pre-wrap">
                {this.state.error?.toString()}
              </pre>
            </div>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Reload Page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

function App() {
  return (
    <ErrorBoundary>
      <DataProvider>
        <div className="min-h-screen bg-gray-100">
          <Header />
          <main className="py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/rankings" element={<RankingsPage />} />
                <Route path="/tier-rankings" element={<TierRankingsPage />} />
                <Route path="/compare" element={<ComparisonPage />} />
                <Route path="/comprehensive" element={<ComprehensiveAnalysisPage />} />
                <Route path="/team-builder" element={<TeamBuilderPage />} />
                <Route path="/pokemon/:id" element={<PokemonDetailsPage />} />
                <Route path="/database" element={<DatabasePage />} />
                <Route path="*" element={<HomePage />} />
              </Routes>
            </div>
          </main>
        </div>
      </DataProvider>
    </ErrorBoundary>
  )
}

export default App 