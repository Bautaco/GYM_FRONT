import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Dumbbell,
  Play,
  CheckCircle,
  AlertCircle,
  Clock,
  Sparkles,
  Info,
  ChevronRight,
  Flame,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { trainingService } from '../../services/trainingService.js';
import { useAuth } from '../auth/AuthContext.js';
import { TrainingPlan, Routine, Exercise, DetectedPR } from '../../types/index.js';
import { VideoPlayerModal } from '../../components/VideoPlayerModal.js';
import { PrCelebrationModal } from '../../components/PrCelebrationModal.js';

interface EditableSetState {
  exerciseId: string;
  exerciseName: string;
  setNumber: number;
  targetWeightKg: number;
  targetReps: number;
  actualWeightKg: string;
  actualReps: string;
  isCompleted: boolean;
}

export const AthleteDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activePlan, setActivePlan] = useState<TrainingPlan | null>(null);
  const [exercisesCatalog, setExercisesCatalog] = useState<Exercise[]>([]);
  const [pastSessions, setPastSessions] = useState<any[]>([]);
  const [selectedRoutineIndex, setSelectedRoutineIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Estado para series editables
  const [sessionSets, setSessionSets] = useState<EditableSetState[]>([]);
  const [sessionNotes, setSessionNotes] = useState('');
  const [isSavingSession, setIsSavingSession] = useState(false);
  const [sessionSuccessMessage, setSessionSuccessMessage] = useState('');
  const [isSessionFinished, setIsSessionFinished] = useState(false);
  const [detectedPrs, setDetectedPrs] = useState<DetectedPR[]>([]);

  // Modal de Video In-App
  const [selectedExerciseForModal, setSelectedExerciseForModal] =
    useState<Exercise | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadPlanAndExercises();
  }, [user]);

  const loadPlanAndExercises = async () => {
    if (!user) return;
    setIsLoading(true);
    setError('');
    try {
      const [planData, catalog, sessions] = await Promise.all([
        trainingService.getActivePlan(user.id),
        trainingService.getExercises(),
        trainingService.getAthleteSessions(user.id),
      ]);
      setActivePlan(planData);
      setExercisesCatalog(catalog);
      setPastSessions(sessions || []);

      // Si hay plan, inicializar la rutina seleccionada
      if (planData && planData.routines.length > 0) {
        const todayDayOfWeek = new Date().getDay(); // 0 = Domingo, 1 = Lunes...
        const matchedIdx = planData.routines.findIndex(
          (r) => r.dayOfWeek === (todayDayOfWeek === 0 ? 7 : todayDayOfWeek),
        );
        const initialIdx = matchedIdx !== -1 ? matchedIdx : 0;
        setSelectedRoutineIndex(initialIdx);
        loadRoutineSessionState(planData.routines[initialIdx], sessions || []);
      }
    } catch (err: any) {
      setError('Error al cargar la información del plan de entrenamiento.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadRoutineSessionState = (
    routine: Routine,
    sessions: any[],
  ) => {
    if (!routine || !routine.exerciseItems) return;
    setSessionSuccessMessage('');
    setError('');

    const todayStr = new Date().toISOString().split('T')[0];
    const existingSession = sessions.find((s) => {
      const sessionDateStr = new Date(s.date).toISOString().split('T')[0];
      return sessionDateStr === todayStr && s.routineId === routine.id;
    });

    if (existingSession && existingSession.sets && existingSession.sets.length > 0) {
      // Sesión ya guardada previamente hoy -> Cargar marcas y activar modo solo lectura
      const loadedSets: EditableSetState[] = existingSession.sets.map((ls: any) => {
        const item = routine.exerciseItems.find((e) => e.exerciseId === ls.exerciseId);
        return {
          exerciseId: ls.exerciseId,
          exerciseName: ls.exerciseName,
          setNumber: ls.setNumber,
          targetWeightKg: item?.targetWeightKg ?? 0,
          targetReps: item?.targetReps ?? 0,
          actualWeightKg: String(ls.actualWeightKg),
          actualReps: String(ls.actualReps),
          isCompleted: Boolean(ls.isCompleted),
        };
      });
      setSessionSets(loadedSets);
      setSessionNotes(existingSession.notes || '');
      setIsSessionFinished(true);
      setSessionSuccessMessage(
        '✓ Ya has registrado esta sesión el día de hoy. Las marcas están en modo solo lectura.',
      );
    } else {
      initSessionSets(routine);
      setSessionNotes('');
      setIsSessionFinished(false);
    }
  };

  const initSessionSets = (routine: Routine) => {
    if (!routine || !routine.exerciseItems) return;
    const initialSets: EditableSetState[] = [];

    routine.exerciseItems.forEach((item) => {
      for (let s = 1; s <= item.targetSets; s++) {
        initialSets.push({
          exerciseId: item.exerciseId,
          exerciseName: item.exerciseName,
          setNumber: s,
          targetWeightKg: item.targetWeightKg,
          targetReps: item.targetReps,
          actualWeightKg: String(item.targetWeightKg), // precargado con carga sugerida
          actualReps: String(item.targetReps),
          isCompleted: false,
        });
      }
    });

    setSessionSets(initialSets);
    setSessionSuccessMessage('');
  };

  const handleRoutineSelect = (index: number) => {
    if (!activePlan) return;
    setSelectedRoutineIndex(index);
    loadRoutineSessionState(activePlan.routines[index], pastSessions);
  };

  const handleSetChange = (
    exerciseId: string,
    setNumber: number,
    field: 'actualWeightKg' | 'actualReps' | 'isCompleted',
    val: any,
  ) => {
    if (isSessionFinished) return;
    setSessionSets((prev) =>
      prev.map((s) => {
        if (s.exerciseId === exerciseId && s.setNumber === setNumber) {
          return { ...s, [field]: val };
        }
        return s;
      }),
    );
  };

  const handleOpenDetailModal = (exerciseId: string) => {
    const found = exercisesCatalog.find((e) => e.id === exerciseId);
    if (found) {
      setSelectedExerciseForModal(found);
      setIsModalOpen(true);
    }
  };

  // Guardado de la sesión de ejecución
  const handleFinishSession = async () => {
    if (!user || !activePlan || isSessionFinished) return;
    setError('');

    const completedCount = sessionSets.filter((s) => s.isCompleted).length;
    if (completedCount === 0) {
      setError(
        'Debes marcar al menos una serie completada (con la casilla correspondiente) antes de finalizar la sesión.',
      );
      return;
    }

    // Validación numérica para series marcadas como completadas
    for (const s of sessionSets) {
      if (s.isCompleted) {
        const weightNum = parseFloat(s.actualWeightKg);
        const repsNum = parseInt(s.actualReps, 10);

        if (isNaN(weightNum) || weightNum < 0) {
          setError(
            `Error en "${s.exerciseName}" Serie ${s.setNumber}: El peso debe ser un número mayor o igual a 0.`,
          );
          return;
        }

        if (isNaN(repsNum) || repsNum <= 0) {
          setError(
            `Error en "${s.exerciseName}" Serie ${s.setNumber}: Las repeticiones deben ser un número mayor a 0 para una serie completada.`,
          );
          return;
        }
      }
    }

    const currentRoutine = activePlan.routines[selectedRoutineIndex];

    setIsSavingSession(true);
    try {
      const result = await trainingService.logWorkoutSession({
        athleteId: user.id,
        trainingPlanId: activePlan.id,
        routineId: currentRoutine?.id || 'routine-1',
        routineName: currentRoutine?.name || 'Rutina Diaria',
        date: new Date().toISOString().split('T')[0],
        completed: true,
        notes: sessionNotes,
        sets: sessionSets.map((s) => ({
          exerciseId: s.exerciseId,
          exerciseName: s.exerciseName,
          setNumber: s.setNumber,
          actualReps: parseInt(s.actualReps, 10) || 0,
          actualWeightKg: parseFloat(s.actualWeightKg) || 0,
          isCompleted: s.isCompleted, // Se guardan solo las series que realmente completó
        })),
      });

      // Actualizar listado local de sesiones completadas
      const savedSession = result.session || result;
      setPastSessions((prev) => [...prev, savedSession]);

      // HU-09: Si se detectaron nuevas marcas personales (PRs), activar celebración
      if (result.personalRecords && result.personalRecords.length > 0) {
        setDetectedPrs(result.personalRecords);
      }

      // Celebración de logro con confeti
      try {
        confetti({
          particleCount: 80,
          colors: ['#5a0505', '#207384', '#eed8c0', '#ffffff'],
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {
        // Fallback seguro
      }

      setSessionSuccessMessage(
        '🎉 ¡Sesión finalizada y marcas guardadas con éxito! Los datos han quedado protegidos contra modificaciones.',
      );

      // Bloquear cualquier modificación posterior (Solo lectura)
      setIsSessionFinished(true);
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'Error al persistir la sesión en el servidor',
      );
    } finally {
      setIsSavingSession(false);
    }
  };

  if (isLoading) {
    return (
      <div className="loading-state-box">
        <div className="spinner"></div>
        <p>Cargando tu plan de entrenamiento personalizado...</p>
      </div>
    );
  }

  // Manejo claro si no tiene plan activo
  if (!activePlan) {
    return (
      <div className="empty-plan-hero">
        <div className="empty-plan-card">
          <div className="empty-icon-circle">
            <Calendar size={48} className="text-muted" />
          </div>
          <h2 className="empty-title">Sin planes vigentes asignados</h2>
          <p className="empty-description">
            Hola <strong>{user?.fullName}</strong>. En este momento no posees ninguna
            rutina activa configurada por tu entrenador.
          </p>
          <div className="empty-instructions-box">
            <Info size={18} />
            <span>
              Comunícate con tu entrenador para que diseñe y asigne tu plan de entrenamiento personalizado.
            </span>
          </div>
        </div>
      </div>
    );
  }

  const currentRoutine = activePlan.routines[selectedRoutineIndex];

  return (
    <div className="dashboard-content-layout">
      {/* Banner del Plan Activo */}
      <div className="plan-hero-banner">
        <div className="hero-badge-wrap">
          <span className="badge badge-success">Plan Activo</span>
          <span className="hero-coach-tag">
            Prescrito por: {activePlan.trainerName || 'Entrenador'}
          </span>
        </div>
        <h1 className="hero-plan-title">{activePlan.name}</h1>
        <div className="hero-meta-row">
          <div className="meta-item">
            <Clock size={16} />
            <span>
              Desde {new Date(activePlan.startDate).toLocaleDateString()} hasta{' '}
              {new Date(activePlan.endDate).toLocaleDateString()}
            </span>
          </div>
          <div className="meta-item">
            <Flame size={16} className="text-accent" />
            <span>{activePlan.routines.length} sesiones por semana</span>
          </div>
        </div>
      </div>

      {/* Selector de Días / Rutinas Semanales */}
      <div className="routines-selector-bar">
        <span className="selector-title">Selecciona tu jornada de entrenamiento:</span>
        <div className="routine-pills-row">
          {activePlan.routines.map((routine, idx) => {
            const isSelected = idx === selectedRoutineIndex;
            return (
              <button
                key={idx}
                onClick={() => handleRoutineSelect(idx)}
                className={`routine-pill-btn ${isSelected ? 'active' : ''}`}
              >
                <div className="pill-dot"></div>
                <div className="pill-text-col">
                  <span className="pill-routine-name">{routine.name}</span>
                  <span className="pill-exercise-count">
                    {routine.exerciseItems?.length || 0} Ejercicios
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Mensajes de Alerta / Éxito */}
      {error && (
        <div className="alert-box alert-error">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {sessionSuccessMessage && (
        <div className="alert-box alert-success">
          <CheckCircle size={20} />
          <span>{sessionSuccessMessage}</span>
        </div>
      )}

      {/* Lista de Ejercicios y Carga de Marcas Reales (HU-02 & HU-03) */}
      <div className="routine-execution-card">
        <div className="routine-header-bar">
          <div>
            <h2 className="routine-heading">{currentRoutine?.name}</h2>
            {currentRoutine?.description && (
              <p className="routine-subheading">{currentRoutine.description}</p>
            )}
          </div>
        </div>

        {/* Ejercicios de la Rutina */}
        <div className="exercises-execution-list">
          {currentRoutine?.exerciseItems?.map((item, itemIdx) => {
            const exerciseSets = sessionSets.filter(
              (s) => s.exerciseId === item.exerciseId,
            );

            return (
              <div key={itemIdx} className="exercise-workout-item">
                <div className="exercise-item-header">
                  <div className="exercise-title-group">
                    <span className="exercise-order-num">#{itemIdx + 1}</span>
                    <div>
                      <h3 className="exercise-name">{item.exerciseName}</h3>
                      <div className="exercise-target-targets">
                        <span>
                          Objetivo: <strong>{item.targetSets}</strong> series ×{' '}
                          <strong>{item.targetReps}</strong> reps @{' '}
                          <strong>{item.targetWeightKg} kg</strong> sugeridos
                        </span>
                        {item.cadence && (
                          <span className="item-cadence-tag">• Tempo: {item.cadence}</span>
                        )}
                        {item.notes && (
                          <span className="item-note-tag">• {item.notes}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="exercise-action-buttons">
                    {/* HU-11: Botón de Descanso Flotante */}
                    {item.restSeconds ? (
                      <button
                        type="button"
                        onClick={() => {
                          window.dispatchEvent(
                            new CustomEvent('start-rest-timer', {
                              detail: { seconds: item.restSeconds },
                            }),
                          );
                        }}
                        className="btn-trigger-rest"
                        title="Iniciar cronómetro de descanso para este ejercicio"
                      >
                        <Clock size={15} />
                        <span>Descanso: {item.restSeconds}s</span>
                      </button>
                    ) : null}

                    {/* HU-07: Botón Ver Detalle / Video In-App */}
                    <button
                      type="button"
                      onClick={() => handleOpenDetailModal(item.exerciseId)}
                      className="btn-open-guide"
                      title="Ver ficha técnica, zonas musculares y video demostrativo"
                    >
                      <Play size={16} />
                      <span>Ver Guía / Técnica</span>
                    </button>
                  </div>
                </div>

                {/* Tabla interactiva de series reales (HU-03) */}
                <div className="sets-table-container">
                  <table className="sets-table">
                    <thead>
                      <tr>
                        <th>Serie</th>
                        <th>Carga Sugerida</th>
                        <th>Peso Real (kg) *</th>
                        <th>Reps Reales *</th>
                        <th>Completado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {exerciseSets.map((set) => (
                        <tr
                          key={set.setNumber}
                          className={set.isCompleted ? 'row-completed' : ''}
                        >
                          <td className="set-num-cell">Serie {set.setNumber}</td>
                          <td className="target-cell">
                            {set.targetWeightKg} kg × {set.targetReps}
                          </td>
                          <td className="input-cell">
                            <input
                              type="number"
                              step="0.5"
                              min="0"
                              disabled={isSessionFinished}
                              value={set.actualWeightKg}
                              onChange={(e) =>
                                handleSetChange(
                                  set.exerciseId,
                                  set.setNumber,
                                  'actualWeightKg',
                                  e.target.value,
                                )
                              }
                              className="table-input"
                              placeholder="kg"
                            />
                          </td>
                          <td className="input-cell">
                            <input
                              type="number"
                              min="0"
                              disabled={isSessionFinished}
                              value={set.actualReps}
                              onChange={(e) =>
                                handleSetChange(
                                  set.exerciseId,
                                  set.setNumber,
                                  'actualReps',
                                  e.target.value,
                                )
                              }
                              className="table-input"
                              placeholder="reps"
                            />
                          </td>
                          <td className="checkbox-cell">
                            <label
                              className={`checkbox-container ${isSessionFinished ? 'is-disabled' : ''}`}
                            >
                              <input
                                type="checkbox"
                                disabled={isSessionFinished}
                                checked={set.isCompleted}
                                onChange={(e) =>
                                  handleSetChange(
                                    set.exerciseId,
                                    set.setNumber,
                                    'isCompleted',
                                    e.target.checked,
                                  )
                                }
                              />
                              <span className="custom-check-box"></span>
                            </label>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>

        {/* Observaciones de la Sesión y Botón Finalizar */}
        <div className="session-finish-footer">
          <div className="notes-field-wrap">
            <label className="form-label">Comentarios o Sensaciones de la Sesión:</label>
            <textarea
              rows={2}
              disabled={isSessionFinished}
              className="form-input textarea-notes"
              placeholder="Ej. Sentí buena potencia en la sentadilla, descansos de 2 minutos..."
              value={sessionNotes}
              onChange={(e) => setSessionNotes(e.target.value)}
            />
          </div>

          <div className="finish-action-row">
            {isSessionFinished ? (
              <div className="session-completed-banner">
                <CheckCircle size={20} className="text-success" />
                <span>Sesión Registrada y Finalizada (Solo lectura)</span>
              </div>
            ) : (
              <button
                onClick={handleFinishSession}
                disabled={isSavingSession}
                className="btn btn-primary btn-large btn-finish-session"
              >
                <Sparkles size={20} />
                <span>{isSavingSession ? 'Guardando Marcas...' : 'Finalizar Sesión'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Video y Zonas Musculares (HU-07) */}
      <VideoPlayerModal
        exercise={selectedExerciseForModal}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      {/* HU-09: Modal de Celebración de Récord Personal (PR) */}
      <PrCelebrationModal
        prs={detectedPrs}
        onClose={() => setDetectedPrs([])}
      />
    </div>
  );
};
