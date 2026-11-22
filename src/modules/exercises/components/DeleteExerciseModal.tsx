import {
  AlertCircle,
  Trash2,
  X,
} from 'lucide-react';
import type { Exercise } from '../exercises.types.js';

interface DeleteExerciseModalProps {
  // El ejercicio que se quiere eliminar.
  // Si es null, el modal se mantiene cerrado.
  exercise: Exercise | null;

  // Mensaje de error producido al intentar eliminar.
  error: string;

  // Indica que la petición de eliminación está en curso.
  isDeleting: boolean;

  // Funciones que el modal comunica a la página.
  onClose: () => void;
  onConfirm: () => void;
}

//Pide confirmación antes de eliminar un ejercicio.
// No elimina directamente: comunica la confirmación a la página,
// que es quien llama al servicio y actualiza el catálogo.
export function DeleteExerciseModal({
  exercise,
  error,
  isDeleting,
  onClose,
  onConfirm,
}: DeleteExerciseModalProps) {
  // Sin ejercicio seleccionado no hay eliminación pendiente.
  if (!exercise) {
    return null;
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-container modal-sm"
        onClick={(event) => event.stopPropagation()}
        role="alertdialog"
      >
        <div className="modal-header">
          <h3 className="modal-title">Confirmar Eliminación</h3>

          <button onClick={onClose} className="btn-icon-close">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body-content">
          {error && (
            <div
              className="alert-box alert-error"
              style={{ marginBottom: 16 }}
            >
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <div className="delete-confirm-body">
            <div className="delete-confirm-icon">
              <Trash2 size={32} />
            </div>

            <p className="delete-confirm-text">
              ¿Estás seguro que deseas eliminar el ejercicio{' '}
              <strong>"{exercise.nombre}"</strong>? Esta acción no se puede
              deshacer.
            </p>
          </div>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary"
            disabled={isDeleting}
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="btn btn-danger"
            disabled={isDeleting}
          >
            <Trash2 size={16} />
            <span>{isDeleting ? 'Eliminando...' : 'Sí, eliminar'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
