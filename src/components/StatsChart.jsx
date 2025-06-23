import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts'

const StatsChart = ({ pokemon, type = 'bar' }) => {
  if (!pokemon || (!pokemon.pvp && !pokemon.raid)) {
    return (
      <div className="bg-gray-50 rounded-lg p-4 text-center">
        <p className="text-gray-500">No stats data available</p>
      </div>
    )
  }

  const prepareBarData = () => {
    const data = []
    
    if (pokemon.pvp) {
      Object.entries(pokemon.pvp).forEach(([league, stats]) => {
        data.push({
          league: league.toUpperCase(),
          score: parseFloat(stats.Score || 0),
          rank: parseInt(stats.Rank || 0)
        })
      })
    }
    
    if (pokemon.raid) {
      data.push({
        league: 'RAID',
        score: pokemon.raid.score || 0,
        rank: 0 // Raid doesn't have rank system
      })
    }
    
    return data
  }

  const prepareRadarData = () => {
    const bestPvp = pokemon.pvp ? Object.values(pokemon.pvp)[0] : null
    
    if (!bestPvp) return []
    
    return [
      {
        stat: 'PVP Score',
        value: parseFloat(bestPvp.Score || 0)
      },
      {
        stat: 'Attack',
        value: parseFloat(bestPvp.Attack || 0) / 2 // Normalize to 0-100 scale
      },
      {
        stat: 'Defense',
        value: parseFloat(bestPvp.Defense || 0) / 2 // Normalize to 0-100 scale
      },
      {
        stat: 'Stamina',
        value: parseFloat(bestPvp.Stamina || 0) / 2 // Normalize to 0-100 scale
      },
      {
        stat: 'Raid Effectiveness',
        value: pokemon.raid ? pokemon.raid.score : 0
      }
    ]
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded shadow-lg">
          <p className="font-semibold">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.dataKey}: {entry.value}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  if (type === 'radar') {
    const radarData = prepareRadarData()
    
    return (
      <div className="bg-white rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-4">Overall Stats</h3>
        <ResponsiveContainer width="100%" height={300}>
          <RadarChart data={radarData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="stat" />
            <PolarRadiusAxis 
              angle={90} 
              domain={[0, 100]}
              tick={{ fontSize: 12 }}
            />
            <Radar
              name="Stats"
              dataKey="value"
              stroke="#4285f4"
              fill="#4285f4"
              fillOpacity={0.3}
            />
            <Tooltip content={<CustomTooltip />} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    )
  }

  const barData = prepareBarData()
  
  return (
    <div className="bg-white rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-4">League Performance</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={barData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="league" />
          <YAxis />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar 
            dataKey="score" 
            fill="#4285f4" 
            name="Score"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default StatsChart 