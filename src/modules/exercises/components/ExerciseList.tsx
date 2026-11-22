// ExerciseList.tsx: Presenta los resultados.
import {
  Dumbbell,
  Pencil,
  Play,
  Trash2,
  VideoOff,
} from 'lucide-react';
import type { UserRole } from '../../../types/index.js';
import type { Exercise } from '../exercises.types.js';

//Props: datos y acciones que la página entrega al listado.
interface ExerciseListProps {
  exercises: Exercise[];// Ejercicios que ya pasaron los filtros de búsqueda y grupo muscular.
  isLoading: boolean; // Indica si todavía se están cargando los ejercicios.
  role: UserRole | null;  // Rol del usuario actual. Permite decidir si muestra Editar y Eliminar.

  // Acciones que el listado comunica a la página.
  onViewDetail: (exercise: Exercise) => void;
  onEdit: (exercise: Exercise) => void;
  onDelete: (exercise: Exercise) => void;
}

//Muestra el estado de carga, el mensaje vacío o las tarjetas de ejercicios.
//No consulta la API ni guarda datos: solo recibe ejercicios ya preparados y comunica las acciones que la persona realiza.
export function ExerciseList({
  exercises,
  isLoading,
  role,
  onViewDetail,
  onEdit,
  onDelete,
}: ExerciseListProps) {
  if (isLoading) {
    return (
      <div className="loading-state-box">
        <div className="spinner"></div>
        <p>Cargando catálogo...</p>
      </div>
    );
  }

  if (exercises.length === 0) {
    return (
      <div className="empty-catalog-box">
        <Dumbbell size={40} className="text-muted" />
        <p>No se encontraron ejercicios con los filtros seleccionados.</p>
      </div>
    );
  }

  return (
    <div className="exercises-grid">
      {exercises.map((exercise) => (
        <div key={exercise.id} className="exercise-card">
          <div className="exercise-card-header">
            <span className="badge badge-primary">
              {exercise.grupoMuscularPrincipal}
            </span>

            {exercise.videoUrl ? (
              <span className="badge badge-video">
                <Play size={12} /> Video In-App
              </span>
            ) : (
              <span className="badge badge-no-video">
                <VideoOff size={12} /> Sin video
              </span>
            )}
          </div>

          <h3 className="card-exercise-name">{exercise.nombre}</h3>
          <p className="card-exercise-desc">{exercise.descripcion}</p>

          {!exercise.videoUrl && (
            <div className="card-no-video-notice">
              <VideoOff size={15} />
              <span>Sin video demostrativo</span>
            </div>
          )}

          <div className="card-zones-box">
            <span className="zones-label">Músculos involucrados:</span>

            <div className="muscle-tags-wrap">
              {exercise.zonasTrabajadas?.map((zone, index) => (
                <span key={index} className="muscle-tag small">
                  {zone}
                </span>
              ))}
            </div>
          </div>

          <div className="card-action-footer">
            <button
              type="button"
              onClick={() => onViewDetail(exercise)}
              className="btn btn-secondary btn-block"
            >
              <Play size={16} />
              <span>Ver Ficha y Video</span>
            </button>

            {/* Solo el entrenador puede editar o eliminar ejercicios. */}
            {role === 'ENTRENADOR' && (
              <div className="card-trainer-actions">
                <button
                  type="button"
                  onClick={() => onEdit(exercise)}
                  className="btn-card-action edit"
                  title="Editar ejercicio"
                >
                  <Pencil size={15} />
                  <span>Editar</span>
                </button>

                <button
                  type="button"
                  onClick={() => onDelete(exercise)}
                  className="btn-card-action delete"
                  title="Eliminar ejercicio"
                >
                  <Trash2 size={15} />
                  <span>Eliminar</span>
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
