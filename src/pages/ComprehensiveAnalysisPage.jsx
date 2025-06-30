import React, { useState } from 'react';
import PokemonAnalysisTable from '../components/PokemonAnalysisTable';

const ComprehensiveAnalysisPage = () => {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [uiSettings, setUiSettings] = useState({
    theme: 'default',
    density: 'comfortable',
    showTooltips: true,
    expandRowsOnClick: true,
    autoRefresh: false,
    animationsEnabled: true
  });

  const handleSettingsChange = (key, value) => {
    setUiSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className={`comprehensive-analysis-page ${uiSettings.theme} ${uiSettings.density}`}>
      {/* Page Header */}
      <div className="page-header">
        <div className="header-content">
          <h1>🔬 Comprehensive Pokemon Analysis</h1>
          <p className="page-description">
            Advanced analysis combining PVP rankings, raid performance tiers, optimal movesets, 
            and evolution family data. Use the controls to customize your view and explore Pokemon performance 
            across all competitive formats.
          </p>
        </div>
        
        <div className="header-actions">
          <button
            onClick={() => setSettingsOpen(true)}
            className="settings-btn"
            title="Open display settings"
          >
            ⚙️ Settings
          </button>
        </div>
      </div>

      {/* Key Features Info */}
      <div className="features-overview">
        <div className="feature-cards">
          <div className="feature-card">
            <h3>🏆 PVP Analysis</h3>
            <p>League rankings, optimal movesets, and competitive viability across Great, Ultra, and Master leagues</p>
          </div>
          <div className="feature-card">
            <h3>⚔️ Raid Performance</h3>
            <p>DPS calculations, tier ratings, and type effectiveness analysis using Dialgadex algorithms</p>
          </div>
          <div className="feature-card">
            <h3>🧬 Evolution Insights</h3>
            <p>Family groupings, evolution stages, and variant analysis for comprehensive Pokemon understanding</p>
          </div>
          <div className="feature-card">
            <h3>🎛️ Advanced Controls</h3>
            <p>Multiple sorting options, column management, type filtering, and expandable detailed views</p>
          </div>
        </div>
      </div>

      {/* Usage Instructions */}
      <div className="usage-instructions">
        <details>
          <summary>📖 How to Use This Analysis Tool</summary>
          <div className="instructions-content">
            <div className="instruction-section">
              <h4>🔍 Search & Filter</h4>
              <ul>
                <li>Search Pokemon by name, ID, or type</li>
                <li>Filter by specific types using the type chips</li>
                <li>Switch between leagues to see different PVP rankings</li>
              </ul>
            </div>
            <div className="instruction-section">
              <h4>📊 Sorting Options</h4>
              <ul>
                <li><strong>Pokedex Number:</strong> Traditional numerical order</li>
                <li><strong>Evolution Family:</strong> Groups families together by lowest dex number</li>
                <li><strong>PVP Ranking:</strong> Best performers in selected league first</li>
                <li><strong>Raid Tier:</strong> Highest raid performance tiers first</li>
                <li><strong>Base Stats:</strong> Highest total stats first</li>
              </ul>
            </div>
            <div className="instruction-section">
              <h4>🏛️ Column Management</h4>
              <ul>
                <li>Use presets for common analysis focuses (PVP, Raid, Essential)</li>
                <li>Toggle individual columns on/off</li>
                <li>Hover over column headers for sorting</li>
              </ul>
            </div>
            <div className="instruction-section">
              <h4>📈 Detailed Analysis</h4>
              <ul>
                <li>Click ▶ to expand rows for detailed breakdowns</li>
                <li>Hover over elements for tooltips with additional info</li>
                <li>View type-specific raid performance and available movesets</li>
              </ul>
            </div>
          </div>
        </details>
      </div>

      {/* Main Analysis Table */}
      <div className="analysis-container">
        <PokemonAnalysisTable />
      </div>

      {/* Settings Modal */}
      {settingsOpen && (
        <div className="settings-modal-overlay" onClick={() => setSettingsOpen(false)}>
          <div className="settings-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Display Settings</h3>
              <button onClick={() => setSettingsOpen(false)} className="close-btn">✕</button>
            </div>
            
            <div className="settings-content">
              <div className="setting-group">
                <label>Theme</label>
                <select 
                  value={uiSettings.theme} 
                  onChange={(e) => handleSettingsChange('theme', e.target.value)}
                >
                  <option value="default">Default</option>
                  <option value="dark">Dark Mode</option>
                  <option value="compact">Compact</option>
                  <option value="high-contrast">High Contrast</option>
                </select>
              </div>

              <div className="setting-group">
                <label>Table Density</label>
                <select 
                  value={uiSettings.density} 
                  onChange={(e) => handleSettingsChange('density', e.target.value)}
                >
                  <option value="comfortable">Comfortable</option>
                  <option value="compact">Compact</option>
                  <option value="spacious">Spacious</option>
                </select>
              </div>

              <div className="setting-group">
                <label>
                  <input
                    type="checkbox"
                    checked={uiSettings.showTooltips}
                    onChange={(e) => handleSettingsChange('showTooltips', e.target.checked)}
                  />
                  Enable tooltips
                </label>
              </div>

              <div className="setting-group">
                <label>
                  <input
                    type="checkbox"
                    checked={uiSettings.expandRowsOnClick}
                    onChange={(e) => handleSettingsChange('expandRowsOnClick', e.target.checked)}
                  />
                  Expand rows on click
                </label>
              </div>

              <div className="setting-group">
                <label>
                  <input
                    type="checkbox"
                    checked={uiSettings.animationsEnabled}
                    onChange={(e) => handleSettingsChange('animationsEnabled', e.target.checked)}
                  />
                  Enable animations
                </label>
              </div>

              <div className="setting-group">
                <label>
                  <input
                    type="checkbox"
                    checked={uiSettings.autoRefresh}
                    onChange={(e) => handleSettingsChange('autoRefresh', e.target.checked)}
                  />
                  Auto-refresh data
                </label>
                <small>Automatically update analysis when new data is available</small>
              </div>
            </div>

            <div className="modal-actions">
              <button 
                onClick={() => {
                  setUiSettings({
                    theme: 'default',
                    density: 'comfortable',
                    showTooltips: true,
                    expandRowsOnClick: true,
                    autoRefresh: false,
                    animationsEnabled: true
                  });
                }}
                className="reset-btn"
              >
                Reset to Defaults
              </button>
              <button 
                onClick={() => setSettingsOpen(false)}
                className="apply-btn"
              >
                Apply Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComprehensiveAnalysisPage; 