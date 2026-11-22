//Presenta los campos y acciones.
import type { FormEvent } from 'react';
import {
  AlertCircle,
  CheckCircle,
  Plus,
  PlusCircle,
  Tag,
  VideoOff,
  X,
} from 'lucide-react';
import type { Exercise, ExerciseFormValues } from '../exercises.types.js';

export type { ExerciseFormValues } from '../exercises.types.js';

interface ExerciseFormModalProps {
  isOpen: boolean;  // Indica si el modal debe mostrarse.

  // Si existe, el formulario está editando ese ejercicio.
  // Si es null, está creando uno nuevo.
  editTarget: Exercise | null;

  // Estado actual de los campos.
  form: ExerciseFormValues;
  muscleGroups: string[];
  formSelectedZones: string[];
  unselectedSuggestions: string[];

  // Estado visual del formulario.
  isCustomGroupMode: boolean;
  customGroupName: string;
  newZoneInput: string;
  error: string;
  success: string;
  isSubmitting: boolean;

  // Funciones que permiten avisar cambios a la página.
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onFormChange: (nextForm: ExerciseFormValues) => void;
  onCustomGroupModeChange: (value: boolean) => void;
  onCustomGroupNameChange: (value: string) => void;
  onNewZoneInputChange: (value: string) => void;
  onAddZone: (zone?: string) => void;
  onRemoveZone: (index: number) => void;
}

//Muestra el formulario de creación y edición de ejercicios.
// El componente dibuja los controles. La página conserva los valores, valida, guarda y decide si se crea o actualiza un ejercicio.
export function ExerciseFormModal({
  isOpen,
  editTarget,
  form,
  muscleGroups,
  formSelectedZones,
  unselectedSuggestions,
  isCustomGroupMode,
  customGroupName,
  newZoneInput,
  error,
  success,
  isSubmitting,
  onClose,
  onSubmit,
  onFormChange,
  onCustomGroupModeChange,
  onCustomGroupNameChange,
  onNewZoneInputChange,
  onAddZone,
  onRemoveZone,
}: ExerciseFormModalProps) {
  // Si está cerrado, no agregamos nada a la pantalla.
  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-container"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <div className="modal-header">
          <h3 className="modal-title">
            {editTarget
              ? `Editar: ${editTarget.nombre}`
              : 'Dar de Alta Nuevo Ejercicio'}
          </h3>

          <button onClick={onClose} className="btn-icon-close">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="modal-body-form">
          {error && (
            <div className="alert-box alert-error">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="alert-box alert-success">
              <CheckCircle size={18} />
              <span>{success}</span>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Nombre del Ejercicio *</label>

            <input
              type="text"
              required
              placeholder="Ej. Hip Thrust con Barra"
              className="form-input"
              value={form.nombre}
              onChange={(event) =>
                onFormChange({
                  ...form,
                  nombre: event.target.value,
                })
              }
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Grupo Muscular Principal *
            </label>

            <div className="group-select-row">
              {!isCustomGroupMode ? (
                <>
                  <select
                    className="form-input"
                    value={form.grupo}
                    onChange={(event) => {
                      if (event.target.value === '__NEW__') {
                        onCustomGroupModeChange(true);
                        onCustomGroupNameChange('');
                        return;
                      }

                      onFormChange({
                        ...form,
                        grupo: event.target.value,
                      });
                    }}
                  >
                    {muscleGroups.map((group) => (
                      <option key={group} value={group}>
                        {group}
                      </option>
                    ))}

                    <option value="__NEW__">
                      ➕ Crear nuevo grupo muscular...
                    </option>
                  </select>

                  <button
                    type="button"
                    onClick={() => {
                      onCustomGroupModeChange(true);
                      onCustomGroupNameChange('');
                    }}
                    className="custom-toggle-btn"
                  >
                    <Plus size={14} />
                    <span>Ingresar un grupo muscular personalizado</span>
                  </button>
                </>
              ) : (
                <div className="custom-group-input-box">
                  <input
                    type="text"
                    autoFocus
                    placeholder="Ej. Cuello, Trapecios, Cardio..."
                    className="form-input"
                    value={customGroupName}
                    onChange={(event) =>
                      onCustomGroupNameChange(event.target.value)
                    }
                  />

                  <button
                    type="button"
                    onClick={() => onCustomGroupModeChange(false)}
                    className="btn btn-secondary btn-sm"
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    Elegir de lista
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              Zonas Trabajadas / Músculos Específicos *
            </label>

            <div className="zone-input-row">
              <input
                type="text"
                placeholder="Escribí una zona y presioná Enter o Agregar..."
                className="form-input"
                value={newZoneInput}
                onChange={(event) =>
                  onNewZoneInputChange(event.target.value)
                }
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    onAddZone();
                  }
                }}
              />

              <button
                type="button"
                onClick={() => onAddZone()}
                className="btn-add-tag"
              >
                <Plus size={15} />
                <span>Agregar</span>
              </button>
            </div>

            <div className="selected-zones-container">
              {formSelectedZones.map((zone, index) => (
                <span key={index} className="selected-zone-badge">
                  <Tag size={12} />
                  <span>{zone}</span>

                  <button
                    type="button"
                    onClick={() => onRemoveZone(index)}
                    className="btn-remove-zone"
                    title="Quitar zona"
                  >
                    <X size={13} />
                  </button>
                </span>
              ))}

              {formSelectedZones.length === 0 && (
                <span className="input-hint" style={{ color: '#f87171' }}>
                  Debes agregar al menos una zona muscular trabajada.
                </span>
              )}
            </div>

            {unselectedSuggestions.length > 0 && (
              <div className="quick-zones-section">
                <span className="quick-zones-title">
                  Zonas registradas en la base de datos:
                </span>

                <div className="quick-zones-pills">
                  {unselectedSuggestions.slice(0, 16).map((zone) => (
                    <button
                      key={zone}
                      type="button"
                      onClick={() => onAddZone(zone)}
                      className="quick-zone-chip"
                      title={`Agregar ${zone}`}
                    >
                      <PlusCircle size={12} />
                      <span>{zone}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Instrucciones Técnicas *</label>

            <textarea
              rows={3}
              required
              placeholder="Pautas de ejecución, postura y rango de recorrido..."
              className="form-input"
              value={form.descripcion}
              onChange={(event) =>
                onFormChange({
                  ...form,
                  descripcion: event.target.value,
                })
              }
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              URL del Video Demostrativo (Opcional)
            </label>

            <input
              type="url"
              placeholder="https://www.youtube.com/watch?v=..."
              className="form-input"
              value={form.videoUrl}
              onChange={(event) =>
                onFormChange({
                  ...form,
                  videoUrl: event.target.value,
                })
              }
            />

            {editTarget && !form.videoUrl && editTarget.videoUrl && (
              <div className="video-clear-warning">
                <VideoOff size={14} />
                <span>
                  Al guardar, se eliminará el video actual y el ejercicio
                  quedará sin video demostrativo.
                </span>
              </div>
            )}

            {!form.videoUrl && (
              <div className="no-video-form-hint">
                <VideoOff size={13} />
                <span>
                  Sin video — el ejercicio quedará sin demostración
                  multimedia.
                </span>
              </div>
            )}

            <span className="input-hint">
              Podés pegar un enlace de YouTube, Shorts o un video directo.
              Dejá el campo vacío para quitar el video.
            </span>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              disabled={isSubmitting}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? 'Guardando...'
                : editTarget
                  ? 'Guardar Cambios'
                  : 'Crear Ejercicio'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
