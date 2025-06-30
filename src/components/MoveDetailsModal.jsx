import React from 'react';
import { X, Zap, Clock, Shield, Target, Info } from 'lucide-react';
import TypeIcon from './TypeIcon';

const MoveDetailsModal = ({ move, onClose, isVisible }) => {
  if (!isVisible || !move) return null;

  // Type effectiveness multipliers
  const typeChart = {
    normal: { weakTo: ['fighting'], resistantTo: [], immuneTo: ['ghost'] },
    fire: { weakTo: ['water', 'ground', 'rock'], resistantTo: ['fire', 'grass', 'ice', 'bug', 'steel', 'fairy'] },
    water: { weakTo: ['electric', 'grass'], resistantTo: ['fire', 'water', 'ice', 'steel'] },
    electric: { weakTo: ['ground'], resistantTo: ['electric', 'flying', 'steel'] },
    grass: { weakTo: ['fire', 'ice', 'poison', 'flying', 'bug'], resistantTo: ['water', 'electric', 'grass', 'ground'] },
    ice: { weakTo: ['fire', 'fighting', 'rock', 'steel'], resistantTo: ['ice'] },
    fighting: { weakTo: ['flying', 'psychic', 'fairy'], resistantTo: ['bug', 'rock', 'dark'] },
    poison: { weakTo: ['ground', 'psychic'], resistantTo: ['grass', 'fighting', 'poison', 'bug', 'fairy'] },
    ground: { weakTo: ['water', 'grass', 'ice'], resistantTo: ['poison', 'rock'], immuneTo: ['electric'] },
    flying: { weakTo: ['electric', 'ice', 'rock'], resistantTo: ['grass', 'fighting', 'bug'], immuneTo: ['ground'] },
    psychic: { weakTo: ['bug', 'ghost', 'dark'], resistantTo: ['fighting', 'psychic'] },
    bug: { weakTo: ['fire', 'flying', 'rock'], resistantTo: ['grass', 'fighting', 'ground'] },
    rock: { weakTo: ['water', 'grass', 'fighting', 'ground', 'steel'], resistantTo: ['normal', 'fire', 'poison', 'flying'] },
    ghost: { weakTo: ['ghost', 'dark'], resistantTo: ['poison', 'bug'], immuneTo: ['normal', 'fighting'] },
    dragon: { weakTo: ['ice', 'dragon', 'fairy'], resistantTo: ['fire', 'water', 'electric', 'grass'] },
    dark: { weakTo: ['fighting', 'bug', 'fairy'], resistantTo: ['ghost', 'dark'], immuneTo: ['psychic'] },
    steel: { weakTo: ['fire', 'fighting', 'ground'], resistantTo: ['normal', 'grass', 'ice', 'flying', 'psychic', 'bug', 'rock', 'dragon', 'steel', 'fairy'], immuneTo: ['poison'] },
    fairy: { weakTo: ['poison', 'steel'], resistantTo: ['fighting', 'bug', 'dark'], immuneTo: ['dragon'] }
  };

  // Calculate DPS and other metrics
  const calculateMoveStats = (move) => {
    if (!move) return {};
    
    const power = move.power || 0;
    const energy = move.energy || 0;
    const duration = move.cooldown || 1000; // milliseconds
    const durationSeconds = duration / 1000;
    
    return {
      dps: power > 0 ? (power / durationSeconds).toFixed(1) : '0',
      eps: energy > 0 ? (energy / durationSeconds).toFixed(1) : '0',
      dpe: power > 0 && energy > 0 ? (power / Math.abs(energy)).toFixed(2) : '0',
      isCharged: move.archetype === 'charged' || move.energy < 0,
      isFast: move.archetype === 'fast' || move.energy > 0
    };
  };

  const stats = calculateMoveStats(move);
  const moveType = move.type?.toLowerCase();
  const effectiveness = typeChart[moveType];

  // Format move effects
  const formatEffects = (move) => {
    const effects = [];
    
    if (move.buffs) {
      move.buffs.forEach(buff => {
        const chance = buff.chance ? `${(buff.chance * 100).toFixed(0)}%` : '';
        const target = buff.target === 'self' ? 'Self' : 'Opponent';
        effects.push(`${chance} ${target}: ${buff.effect}`);
      });
    }
    
    if (move.debuffs) {
      move.debuffs.forEach(debuff => {
        const chance = debuff.chance ? `${(debuff.chance * 100).toFixed(0)}%` : '';
        effects.push(`${chance} Opponent: ${debuff.effect}`);
      });
    }
    
    return effects;
  };

  const effects = formatEffects(move);

  return (
    <div className="move-modal-overlay" onClick={onClose}>
      <div className="move-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="move-modal-header">
          <div className="move-title-section">
            <h2 className="move-name">{move.name}</h2>
            <div className="move-type-badge">
              <TypeIcon type={moveType} size="medium" />
              <span className="type-label">{moveType?.charAt(0).toUpperCase() + moveType?.slice(1)}</span>
            </div>
          </div>
          
          <button onClick={onClose} className="close-modal-btn">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="move-modal-content">
          {/* Basic Stats */}
          <div className="move-stats-grid">
            <div className="stat-card">
              <Target className="stat-icon" />
              <div className="stat-value">{move.power || 0}</div>
              <div className="stat-label">Power</div>
            </div>
            
            <div className="stat-card">
              <Zap className="stat-icon" />
              <div className="stat-value">{move.energy || 0}</div>
              <div className="stat-label">Energy</div>
            </div>
            
            <div className="stat-card">
              <Clock className="stat-icon" />
              <div className="stat-value">{move.cooldown || 0}ms</div>
              <div className="stat-label">Duration</div>
            </div>
            
            <div className="stat-card">
              <Shield className="stat-icon" />
              <div className="stat-value">{stats.isCharged ? 'Charged' : 'Fast'}</div>
              <div className="stat-label">Type</div>
            </div>
          </div>

          {/* Calculated Metrics */}
          <div className="calculated-metrics">
            <h3 className="section-title">Performance Metrics</h3>
            <div className="metrics-grid">
              <div className="metric-item">
                <span className="metric-label">DPS (Damage per Second):</span>
                <span className="metric-value">{stats.dps}</span>
              </div>
              
              {stats.eps !== '0' && (
                <div className="metric-item">
                  <span className="metric-label">EPS (Energy per Second):</span>
                  <span className="metric-value">{stats.eps}</span>
                </div>
              )}
              
              {stats.dpe !== '0' && (
                <div className="metric-item">
                  <span className="metric-label">DPE (Damage per Energy):</span>
                  <span className="metric-value">{stats.dpe}</span>
                </div>
              )}
            </div>
          </div>

          {/* Move Effects */}
          {effects.length > 0 && (
            <div className="move-effects">
              <h3 className="section-title">Effects</h3>
              <ul className="effects-list">
                {effects.map((effect, index) => (
                  <li key={index} className="effect-item">
                    <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span>{effect}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Type Effectiveness */}
          {effectiveness && (
            <div className="type-effectiveness">
              <h3 className="section-title">Type Effectiveness</h3>
              
              {effectiveness.weakTo?.length > 0 && (
                <div className="effectiveness-category">
                  <h4 className="effectiveness-label weak">Weak Against:</h4>
                  <div className="type-list">
                    {effectiveness.weakTo.map(type => (
                      <div key={type} className="effectiveness-type">
                        <TypeIcon type={type} size="small" />
                        <span className="type-name">{type}</span>
                        <span className="multiplier weak">×0.5</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {effectiveness.resistantTo?.length > 0 && (
                <div className="effectiveness-category">
                  <h4 className="effectiveness-label strong">Strong Against:</h4>
                  <div className="type-list">
                    {effectiveness.resistantTo.map(type => (
                      <div key={type} className="effectiveness-type">
                        <TypeIcon type={type} size="small" />
                        <span className="type-name">{type}</span>
                        <span className="multiplier strong">×2.0</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {effectiveness.immuneTo?.length > 0 && (
                <div className="effectiveness-category">
                  <h4 className="effectiveness-label immune">No Effect:</h4>
                  <div className="type-list">
                    {effectiveness.immuneTo.map(type => (
                      <div key={type} className="effectiveness-type">
                        <TypeIcon type={type} size="small" />
                        <span className="type-name">{type}</span>
                        <span className="multiplier immune">×0</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Additional Info */}
          <div className="additional-info">
            <h3 className="section-title">Additional Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Move ID:</span>
                <span className="info-value">{move.moveId || 'Unknown'}</span>
              </div>
              
              {move.vfxName && (
                <div className="info-item">
                  <span className="info-label">Animation:</span>
                  <span className="info-value">{move.vfxName}</span>
                </div>
              )}
              
              <div className="info-item">
                <span className="info-label">Category:</span>
                <span className="info-value">
                  {stats.isCharged ? 'Charged Attack' : 'Fast Attack'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoveDetailsModal; 