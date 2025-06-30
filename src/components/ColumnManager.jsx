import React, { useState } from 'react';

const ColumnManager = ({ columns, visibleColumns, onColumnToggle }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggleColumn = (columnKey) => {
    onColumnToggle({
      ...visibleColumns,
      [columnKey]: !visibleColumns[columnKey]
    });
  };

  const handleSelectAll = () => {
    const allVisible = {};
    columns.forEach(col => {
      allVisible[col.key] = true;
    });
    onColumnToggle(allVisible);
  };

  const handleSelectNone = () => {
    const noneVisible = {};
    columns.forEach(col => {
      noneVisible[col.key] = false;
    });
    onColumnToggle(noneVisible);
  };

  // Preset configurations
  const presets = {
    essential: {
      pokemon: true,
      types: true,
      pvpRank: true,
      raidTier: true,
      stats: false,
      pvpMoveset: false,
      raidMoveset: false,
      evolutionInfo: false
    },
    pvpFocused: {
      pokemon: true,
      types: true,
      stats: true,
      pvpRank: true,
      pvpMoveset: true,
      raidTier: false,
      raidMoveset: false,
      evolutionInfo: true
    },
    raidFocused: {
      pokemon: true,
      types: true,
      stats: true,
      pvpRank: false,
      pvpMoveset: false,
      raidTier: true,
      raidMoveset: true,
      evolutionInfo: false
    },
    comprehensive: {
      pokemon: true,
      types: true,
      stats: true,
      pvpRank: true,
      pvpMoveset: true,
      raidTier: true,
      raidMoveset: true,
      evolutionInfo: true
    }
  };

  const handlePreset = (presetKey) => {
    onColumnToggle(presets[presetKey]);
    setIsOpen(false);
  };

  const visibleCount = Object.values(visibleColumns).filter(Boolean).length;
  const totalCount = columns.length;

  return (
    <div className="column-manager">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="column-manager-toggle"
        title="Manage visible columns"
      >
        ⚙️ Columns ({visibleCount}/{totalCount})
      </button>

      {isOpen && (
        <div className="column-manager-dropdown">
          <div className="column-manager-header">
            <h4>Manage Columns</h4>
            <button
              onClick={() => setIsOpen(false)}
              className="close-btn"
            >
              ✕
            </button>
          </div>

          {/* Quick actions */}
          <div className="column-manager-actions">
            <button onClick={handleSelectAll} className="action-btn">
              Show All
            </button>
            <button onClick={handleSelectNone} className="action-btn">
              Hide All
            </button>
          </div>

          {/* Presets */}
          <div className="column-manager-presets">
            <h5>Quick Presets</h5>
            <div className="preset-buttons">
              <button
                onClick={() => handlePreset('essential')}
                className="preset-btn"
                title="Essential columns only"
              >
                Essential
              </button>
              <button
                onClick={() => handlePreset('pvpFocused')}
                className="preset-btn"
                title="Focus on PVP analysis"
              >
                PVP Focus
              </button>
              <button
                onClick={() => handlePreset('raidFocused')}
                className="preset-btn"
                title="Focus on raid analysis"
              >
                Raid Focus
              </button>
              <button
                onClick={() => handlePreset('comprehensive')}
                className="preset-btn"
                title="Show everything"
              >
                Complete
              </button>
            </div>
          </div>

          {/* Individual column toggles */}
          <div className="column-manager-list">
            <h5>Individual Columns</h5>
            {columns.map(column => (
              <label
                key={column.key}
                className="column-toggle"
                title={column.description}
              >
                <input
                  type="checkbox"
                  checked={visibleColumns[column.key] || false}
                  onChange={() => handleToggleColumn(column.key)}
                />
                <span className="column-label">{column.label}</span>
                <span className="column-description">{column.description}</span>
              </label>
            ))}
          </div>

          {/* Column count info */}
          <div className="column-manager-info">
            Showing {visibleCount} of {totalCount} columns
          </div>
        </div>
      )}
    </div>
  );
};

export default ColumnManager; 