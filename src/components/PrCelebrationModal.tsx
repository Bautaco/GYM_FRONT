import React from 'react';
import { Trophy, Sparkles, TrendingUp, X, Award } from 'lucide-react';
import { DetectedPR } from '../types/index.js';

interface PrCelebrationModalProps {
  prs: DetectedPR[];
  onClose: () => void;
}

export const PrCelebrationModal: React.FC<PrCelebrationModalProps> = ({ prs, onClose }) => {
  if (!prs || prs.length === 0) return null;

  return (
    <div className="modal-backdrop pr-celebration-backdrop">
      <div className="modal-container pr-celebration-card">
        {/* Close Button */}
        <button onClick={onClose} className="btn-close-modal" aria-label="Cerrar">
          <X size={20} />
        </button>

        {/* Trophy Header */}
        <div className="pr-celebration-header">
          <div className="pr-trophy-badge-box">
            <Trophy size={48} className="pr-trophy-icon" />
            <Sparkles size={24} className="pr-sparkle-1" />
            <Sparkles size={20} className="pr-sparkle-2" />
          </div>
          <h2 className="pr-celebration-title">¡NUEVA MARCA PERSONAL!</h2>
          <p className="pr-celebration-subtitle">
            ¡Felicitaciones! En esta sesión superaste tus récords históricos de fuerza.
          </p>
        </div>

        {/* PR List Cards */}
        <div className="pr-cards-list">
          {prs.map((pr, index) => (
            <div key={index} className="pr-item-card">
              <div className="pr-item-lead">
                <div className="pr-item-icon">
                  <Award size={22} />
                </div>
                <div>
                  <h4 className="pr-exercise-name">{pr.exerciseName}</h4>
                  <span className="pr-record-type">
                    {pr.type === 'PESO_MAXIMO' ? 'Carga Máxima Levantada' : '1RM Estimado'}
                  </span>
                </div>
              </div>

              <div className="pr-item-stats">
                <div className="pr-stat-box old">
                  <span className="pr-stat-label">Anterior</span>
                  <span className="pr-stat-value">{pr.previousRecord} kg</span>
                </div>

                <div className="pr-stat-arrow">
                  <TrendingUp size={18} />
                </div>

                <div className="pr-stat-box new">
                  <span className="pr-stat-label">Nuevo Récord</span>
                  <span className="pr-stat-value">{pr.newRecord} kg</span>
                </div>

                <div className="pr-improvement-pill">
                  +{pr.improvement} kg
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Action */}
        <div className="pr-celebration-footer">
          <button onClick={onClose} className="btn-primary btn-pr-action">
            ¡Excelente, Continuar!
          </button>
        </div>
      </div>
    </div>
  );
};
