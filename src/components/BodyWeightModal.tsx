import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Scale, Check, AlertCircle } from 'lucide-react';
import { trainingService } from '../services/trainingService.js';
import { useAuth } from '../features/auth/AuthContext.js';

interface BodyWeightModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const BodyWeightModal: React.FC<BodyWeightModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuth();
  const [weightKg, setWeightKg] = useState('');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const val = parseFloat(weightKg);
    if (isNaN(val) || val <= 0) {
      setErrorMessage('Por favor ingresa un peso válido mayor a 0 kg.');
      return;
    }

    if (!user) return;

    setIsLoading(true);
    try {
      await trainingService.logBodyWeight(user.id, val, notes);
      setSuccessMessage('¡Peso registrado exitosamente!');
      setWeightKg('');
      setNotes('');
      if (onSuccess) onSuccess();
      setTimeout(() => {
        onClose();
        setSuccessMessage('');
      }, 1200);
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.message || 'Error al registrar el peso corporal',
      );
    } finally {
      setIsLoading(false);
    }
  };

  return createPortal(
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-container weight-modal-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="weight-modal-title"
      >
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="icon-badge">
              <Scale size={20} />
            </div>
            <h3 id="weight-modal-title" className="modal-title">Registrar Peso Corporal</h3>
          </div>
          <button onClick={onClose} className="btn-icon-close" aria-label="Cerrar">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="weight-form">
          <div className="modal-body weight-form-fields">
          <p className="form-helper-text">
            Ingresa tu peso en kilogramos para actualizar tu historial de evolución.
            La fecha se registrará automáticamente ({new Date().toLocaleDateString()}).
          </p>

          {errorMessage && (
            <div className="alert-box alert-error">
              <AlertCircle size={18} />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="alert-box alert-success">
              <Check size={18} />
              <span>{successMessage}</span>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="weightKgInput" className="form-label">
              Peso Corporal (kg) *
            </label>
            <div className="input-with-suffix">
              <input
                id="weightKgInput"
                type="number"
                step="0.1"
                min="10"
                max="300"
                required
                autoFocus
                placeholder="Ej. 75.5"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                className="form-input"
              />
              <span className="input-suffix">kg</span>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="notesInput" className="form-label">
              Notas u Observaciones (Opcional)
            </label>
            <input
              id="notesInput"
              type="text"
              placeholder="Ej. En ayunas, pesaje semanal"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="form-input"
            />
          </div>

          </div>
          <div className="modal-footer">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading || !weightKg}
            >
              {isLoading ? 'Guardando...' : 'Guardar Pesaje'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
};
