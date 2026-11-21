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
  X,
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
  const [allPlans, setAllPlans] = useState<TrainingPlan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
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
  const [weeklyScheduleNotice, setWeeklyScheduleNotice] = useState('');
  const [detectedPrs, setDetectedPrs] = useState<DetectedPR[]>([]);

  // Modal de Video In-App
  const [selectedExerciseForModal, setSelectedExerciseForModal] =
    useState<Exercise | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Modal de confirmación al finalizar sesión
  const [isConfirmFinishModalOpen, setIsConfirmFinishModalOpen] = useState(false);

  useEffect(() => {
    loadPlanAndExercises();
  }, [user]);

  const loadPlanAndExercises = async () => {
    if (!user) return;
    setIsLoading(true);
    setError('');
    try {
      const [planData, allPlansData, catalog, sessions] = await Promise.all([
        trainingService.getActivePlan(user.id),
        trainingService.getAllPlansByAthlete(user.id),
        trainingService.getExercises(),
        trainingService.getAthleteSessions(user.id),
      ]);
      setActivePlan(planData);
      setAllPlans(allPlansData || []);
      setExercisesCatalog(catalog);
      setPastSessions(sessions || []);

      const planToDisplay =
        planData ||
        (allPlansData && allPlansData.length > 0 ? allPlansData[0] : null);

      if (planToDisplay) {
        setSelectedPlanId(planToDisplay.id);
        if (planToDisplay.routines && planToDisplay.routines.length > 0) {
          selectNextPendingRoutine(planToDisplay.routines, sessions || [], planToDisplay.id);
        }
      }
    } catch (err: any) {
      setError('Error al cargar la información del plan de entrenamiento.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDisplayDate = (dateVal: string | Date | undefined) => {
    if (!dateVal) return '';
    const dateStr = dateVal instanceof Date ? dateVal.toISOString() : String(dateVal);
    const raw = dateStr.slice(0, 10);
    const parts = raw.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return raw;
  };

  const getLocalDateKey = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getSessionDateKey = (session: any) => {
    const rawDate = String(session.date || '');
    return /^\d{4}-\d{2}-\d{2}/.test(rawDate)
      ? rawDate.slice(0, 10)
      : getLocalDateKey(new Date(session.date));
  };

  // La numeración se presenta siempre en el selector aunque un entrenador haya
  // cargado una plantilla con un nombre libre, por ejemplo “Rutina de Piernas”.
  const getRoutineDisplayName = (routine: Routine, index: number) => {
    const nameWithoutDayPrefix = (routine.name || 'Sesión de entrenamiento')
      .replace(/^día\s*\d+\s*:\s*/i, '')
      .trim();
    return `Día ${index + 1}: ${nameWithoutDayPrefix}`;
  };

  const displayedPlan =
    (selectedPlanId && allPlans.find((p) => p.id === selectedPlanId)) ||
    activePlan ||
    (allPlans.length > 0 ? allPlans[0] : null);

  const todayStr = getLocalDateKey(new Date());
  const planStartStr = displayedPlan ? String(displayedPlan.startDate).slice(0, 10) : '';
  const planEndStr = displayedPlan ? String(displayedPlan.endDate).slice(0, 10) : '';
  const isCurrentDateWithinPlan = Boolean(
    displayedPlan && planStartStr <= todayStr && todayStr <= planEndStr,
  );
  const isUpcomingPlan = Boolean(displayedPlan && planStartStr > todayStr);
  const isExpiredPlan = Boolean(displayedPlan && planEndStr < todayStr);

  const upcomingPlan = allPlans.find((p) => {
    const s = String(p.startDate).slice(0, 10);
    return s > todayStr;
  });

  const isRoutineCompletedToday = (routineId?: string, planId?: string) => {
    if (!routineId) return false;
    const currentPlanId = planId || displayedPlan?.id;
    return pastSessions.some((s) => {
      const sessionDateStr = getSessionDateKey(s);
      const matchesPlan = !s.trainingPlanId || !currentPlanId || s.trainingPlanId === currentPlanId;
      return (
        Boolean(s.completed) &&
        s.routineId === routineId &&
        sessionDateStr === todayStr &&
        matchesPlan
      );
    });
  };

  const selectNextPendingRoutine = (
    routines: Routine[],
    sessions: any[],
    planId?: string,
  ) => {
    if (!routines || routines.length === 0) return;

    const today = new Date();
    const currentDay = today.getDay() || 7; // 1 = Lunes, ..., 7 = Domingo
    const todayKey = getLocalDateKey(today);

    const isSessionDoneToday = (routineId?: string) => {
      if (!routineId) return false;
      return sessions.some((s) => {
        const sessionDateStr = getSessionDateKey(s);
        const matchesPlan = !s.trainingPlanId || !planId || s.trainingPlanId === planId;
        return (
          Boolean(s.completed) &&
          s.routineId === routineId &&
          sessionDateStr === todayKey &&
          matchesPlan
        );
      });
    };

    // 1. Intentar seleccionar la rutina programada para el día de la semana de hoy si no se ha completado
    let targetIndex = routines.findIndex(
      (r) => r.dayOfWeek === currentDay && !isSessionDoneToday(r.id),
    );

    // 2. Si hoy no hay rutina o ya se completó, seleccionar la primera rutina del plan que esté pendiente hoy
    if (targetIndex === -1) {
      targetIndex = routines.findIndex((r) => !isSessionDoneToday(r.id));
    }

    // 3. Si todas las rutinas del plan ya fueron completadas hoy, dejar seleccionada la primera
    if (targetIndex === -1) {
      targetIndex = 0;
      setWeeklyScheduleNotice(
        '✓ Has completado las sesiones de entrenamiento de hoy. Tus marcas están guardadas.',
      );
    } else {
      setWeeklyScheduleNotice('');
    }

    setSelectedRoutineIndex(targetIndex);
    loadRoutineSessionState(routines[targetIndex], sessions, planId);
  };

  const loadRoutineSessionState = (
    routine: Routine,
    sessions: any[],
    planId?: string,
  ) => {
    if (!routine || !routine.exerciseItems) return;
    setSessionSuccessMessage('');
    setError('');

    const currentPlanId = planId || displayedPlan?.id;
    const currentTodayStr = getLocalDateKey(new Date());
    const existingSession = sessions.find((s) => {
      const sessionDateStr = getSessionDateKey(s);
      const matchesPlan = !s.trainingPlanId || !currentPlanId || s.trainingPlanId === currentPlanId;
      return (
        Boolean(s.completed) &&
        s.routineId === routine.id &&
        sessionDateStr === currentTodayStr &&
        matchesPlan
      );
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
      // Rutina aún no registrada hoy -> inicializar series y habilitar edición
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

  const handlePlanSelect = (planId: string) => {
    setSelectedPlanId(planId);
    setWeeklyScheduleNotice('');
    const target = allPlans.find((p) => p.id === planId);
    if (target && target.routines.length > 0) {
      selectNextPendingRoutine(target.routines, pastSessions, planId);
    }
  };

  const handleRoutineSelect = (index: number) => {
    if (!displayedPlan) return;
    setSelectedRoutineIndex(index);
    loadRoutineSessionState(displayedPlan.routines[index], pastSessions, displayedPlan.id);
  };

  const handleSetChange = (
    exerciseId: string,
    setNumber: number,
    field: 'actualWeightKg' | 'actualReps' | 'isCompleted',
    val: any,
  ) => {
    if (isSessionFinished || isUpcomingPlan) return;
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

  // Validación previa antes de abrir modal de confirmación
  const handleRequestFinishSession = () => {
    if (!user || !displayedPlan || isSessionFinished || isUpcomingPlan) return;
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

    // Si todas las validaciones pasan, se despliega el modal de confirmación
    setIsConfirmFinishModalOpen(true);
  };

  // Guardado real de la sesión tras confirmación del atleta
  const handleConfirmAndSaveSession = async () => {
    setIsConfirmFinishModalOpen(false);
    if (!user || !displayedPlan || isSessionFinished || isUpcomingPlan) return;

    const currentRoutine = displayedPlan.routines[selectedRoutineIndex];

    setIsSavingSession(true);
    try {
      const result = await trainingService.logWorkoutSession({
        athleteId: user.id,
        trainingPlanId: displayedPlan.id,
        routineId: currentRoutine?.id || 'routine-1',
        routineName: currentRoutine?.name || 'Rutina Diaria',
        date: getLocalDateKey(new Date()),
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
      const updatedSessions = [...pastSessions, savedSession];
      setPastSessions(updatedSessions);

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
      // Busca la próxima jornada pendiente de esta semana. Si no existe,
      // muestra un aviso para no repetir una rutina ya finalizada.
      selectNextPendingRoutine(displayedPlan.routines, updatedSessions);
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

  // Manejo claro si no tiene planes asignados
  if (!displayedPlan) {
    return (
      <div className="empty-plan-hero">
        <div className="empty-plan-card">
          <div className="empty-icon-circle">
            <Calendar size={48} className="text-muted" />
          </div>
          <h2 className="empty-title">Sin planes asignados</h2>
          <p className="empty-description">
            Hola <strong>{user?.fullName}</strong>. En este momento no posees ninguna
            rutina activa ni programada configurada por tu entrenador.
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

  const currentRoutine = displayedPlan.routines[selectedRoutineIndex];

  return (
    <div className="dashboard-content-layout">
      {/* Alerta si el atleta está viendo su plan activo pero ya tiene un próximo plan programado */}
      {upcomingPlan && displayedPlan.id !== upcomingPlan.id && (
        <div
          className="alert-box alert-info mb-3"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 16px',
            borderRadius: '10px',
          }}
        >
          <Calendar size={20} />
          <span>
            Tienes un nuevo plan programado: <strong>"{upcomingPlan.name}"</strong> a partir del{' '}
            <strong>{formatDisplayDate(upcomingPlan.startDate)}</strong>.
          </span>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            style={{ marginLeft: 'auto', padding: '6px 14px', fontSize: '0.85rem' }}
            onClick={() => handlePlanSelect(upcomingPlan.id)}
          >
            Previsualizar Rutinas
          </button>
        </div>
      )}

      {/* Banner del Plan */}
      <div className="plan-hero-banner">
        <div className="hero-badge-wrap" style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          {isCurrentDateWithinPlan ? (
            <span className="badge badge-success">Plan Activo</span>
          ) : isUpcomingPlan ? (
            <span
              className="badge"
              style={{
                backgroundColor: '#1d4ed8',
                color: '#ffffff',
                padding: '4px 10px',
                borderRadius: '999px',
                fontSize: '0.8rem',
                fontWeight: 600,
              }}
            >
              Plan Programado
            </span>
          ) : (
            <span
              className="badge"
              style={{
                backgroundColor: '#64748b',
                color: '#ffffff',
                padding: '4px 10px',
                borderRadius: '999px',
                fontSize: '0.8rem',
                fontWeight: 600,
              }}
            >
              Plan Finalizado
            </span>
          )}
          <span className="hero-coach-tag">
            Prescrito por: {displayedPlan.trainerName || 'Entrenador'}
          </span>

          {allPlans.length > 1 && (
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.85rem', opacity: 0.85 }}>Ver Plan:</span>
              <select
                className="form-input form-select"
                style={{ padding: '4px 10px', fontSize: '0.85rem', minWidth: '190px' }}
                value={displayedPlan.id}
                onChange={(e) => handlePlanSelect(e.target.value)}
              >
                {allPlans.map((p) => {
                  const s = String(p.startDate).slice(0, 10);
                  const e = String(p.endDate).slice(0, 10);
                  const isCurrent = s <= todayStr && todayStr <= e;
                  const isUpcoming = s > todayStr;
                  const tag = isCurrent ? ' (Activo)' : isUpcoming ? ' (Programado)' : ' (Finalizado)';
                  return (
                    <option key={p.id} value={p.id}>
                      {p.name}{tag}
                    </option>
                  );
                })}
              </select>
            </div>
          )}
        </div>
        <h1 className="hero-plan-title">{displayedPlan.name}</h1>
        <div className="hero-meta-row">
          <div className="meta-item">
            <Clock size={16} />
            <span>
              Desde {formatDisplayDate(displayedPlan.startDate)} hasta{' '}
              {formatDisplayDate(displayedPlan.endDate)}
            </span>
          </div>
          <div className="meta-item">
            <Flame size={16} className="text-accent" />
            <span>{displayedPlan.routines.length} sesiones por semana</span>
          </div>
        </div>
      </div>

      {/* Selector de Días / Rutinas Semanales */}
      <div className="routines-selector-bar">
        <span className="selector-title">Selecciona tu jornada de entrenamiento:</span>
        <div className="routine-pills-row">
          {displayedPlan.routines.map((routine, idx) => {
            const isSelected = idx === selectedRoutineIndex;
            const isDoneToday = isRoutineCompletedToday(routine.id, displayedPlan.id);
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleRoutineSelect(idx)}
                className={`routine-pill-btn ${isSelected ? 'active' : ''} ${isDoneToday ? 'completed' : ''}`}
                style={
                  isDoneToday && !isSelected
                    ? { borderColor: 'rgba(16, 185, 129, 0.4)', background: 'rgba(16, 185, 129, 0.08)' }
                    : undefined
                }
              >
                <div
                  className="pill-dot"
                  style={isDoneToday ? { backgroundColor: '#10b981' } : undefined}
                ></div>
                <div className="pill-text-col">
                  <span className="pill-routine-name">
                    {getRoutineDisplayName(routine, idx)} {isDoneToday ? '✓' : ''}
                  </span>
                  <span className="pill-exercise-count">
                    {routine.exerciseItems?.length || 0} Ejercicios {isDoneToday ? '· Completado hoy' : ''}
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

      {weeklyScheduleNotice && (
        <div className="alert-box alert-success weekly-schedule-notice">
          <Calendar size={20} />
          <span>{weeklyScheduleNotice}</span>
        </div>
      )}

      {/* Lista de Ejercicios y Carga de Marcas Reales (HU-02 & HU-03) */}
      <div className="routine-execution-card">
        <div className="routine-header-bar">
          <div>
            <h2 className="routine-heading">
              {currentRoutine && getRoutineDisplayName(currentRoutine, selectedRoutineIndex)}
            </h2>
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
                              disabled={isSessionFinished || isUpcomingPlan}
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
                              disabled={isSessionFinished || isUpcomingPlan}
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
                              className={`checkbox-container ${isSessionFinished || isUpcomingPlan ? 'is-disabled' : ''}`}
                            >
                              <input
                                type="checkbox"
                                disabled={isSessionFinished || isUpcomingPlan}
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
              disabled={isSessionFinished || isUpcomingPlan}
              className="form-input textarea-notes"
              placeholder={
                isUpcomingPlan
                  ? 'Podrás agregar observaciones cuando inicie la fecha del plan...'
                  : 'Ej. Sentí buena potencia en la sentadilla, descansos de 2 minutos...'
              }
              value={sessionNotes}
              onChange={(e) => setSessionNotes(e.target.value)}
            />
          </div>

          <div className="finish-action-row">
            {isUpcomingPlan ? (
              <div
                className="alert-box alert-info"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 16px',
                  borderRadius: '8px',
                }}
              >
                <Calendar size={18} />
                <span>
                  Este plan está programado para comenzar el{' '}
                  <strong>{formatDisplayDate(displayedPlan.startDate)}</strong>. Podrás registrar tus series cuando llegue esa fecha.
                </span>
              </div>
            ) : isSessionFinished ? (
              <div className="session-completed-banner">
                <CheckCircle size={20} className="text-success" />
                <span>Sesión Registrada y Finalizada (Solo lectura)</span>
              </div>
            ) : (
              <button
                onClick={handleRequestFinishSession}
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



      {/* Modal de Confirmación de Finalización de Sesión (Seguridad y UX) */}


      {isConfirmFinishModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsConfirmFinishModalOpen(false)}>
          <div
            className="modal-container modal-sm finish-confirm-card"
            onClick={(e) => e.stopPropagation()}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="finish-confirm-title"
          >
            <div className="modal-header">
              <div className="modal-title-group">
                <Sparkles size={20} className="text-primary" />
                <h3 id="finish-confirm-title" className="modal-title">
                  Finalizar Sesión de Entrenamiento
                </h3>
              </div>
              <button
                onClick={() => setIsConfirmFinishModalOpen(false)}
                className="btn-icon-close"
                title="Cerrar (Cancelar)"
                aria-label="Cerrar modal"
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-body-content">
              <div className="finish-confirm-body">
                <div className="finish-confirm-icon-box">
                  <Dumbbell size={36} className="text-primary" />
                </div>
                <h4 className="finish-confirm-heading">¿Confirmar fin del entrenamiento?</h4>
                <p className="finish-confirm-text">
                  ¿Estás seguro de que deseas finalizar la sesión de entrenamiento del día? Se guardarán todas las series registradas.
                </p>
                <div className="finish-confirm-badge-summary">
                  <span>
                    Series completadas:{' '}
                    <strong>{sessionSets.filter((s) => s.isCompleted).length}</strong> de{' '}
                    <strong>{sessionSets.length}</strong>
                  </span>
                </div>
              </div>
            </div>

            <div className="modal-footer finish-confirm-footer">
              <button
                type="button"
                onClick={() => setIsConfirmFinishModalOpen(false)}
                className="btn btn-secondary"
                disabled={isSavingSession}
              >
                Cancelar / Seguir Entrenando
              </button>
              <button
                type="button"
                onClick={handleConfirmAndSaveSession}
                disabled={isSavingSession}
                className="btn btn-primary"
              >
                <CheckCircle size={16} />
                <span>{isSavingSession ? 'Guardando...' : 'Confirmar y Guardar'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

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
