import React, { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Save,
  User,
  Calendar,
  Dumbbell,
  AlertCircle,
  CheckCircle,
  Clock,
  Layers,
  Bookmark,
  FileDown,
  X,
  FileText,
  RotateCcw,
  History,
  Edit3,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { trainingService } from '../../services/trainingService.js';
import { authService } from '../../services/authService.js';
import { User as AthleteUser, Exercise, RoutineTemplate, TrainingPlan } from '../../types/index.js';

interface RoutineFormState {
  name: string;
  dayOfWeek: number;
  description: string;
  exerciseItems: {
    exerciseId: string;
    exerciseName: string;
    targetSets: number;
    targetReps: number;
    targetWeightKg: number;
    restSeconds: number;
    notes: string;
    cadence?: string; // HU-12: Cadencia / Tempo (ej. "3-0-1-0")
  }[];
}

const formatDisplayDate = (d?: string | Date) => {
  if (!d) return '';
  const dateStr = d instanceof Date ? d.toISOString().slice(0, 10) : String(d).slice(0, 10);
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const [year, month, day] = parts;
  return `${day}/${month}/${year}`;
};

export const TrainerPlanBuilder: React.FC = () => {
  const [athletes, setAthletes] = useState<AthleteUser[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [templates, setTemplates] = useState<RoutineTemplate[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Formulario del Plan
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [planName, setPlanName] = useState('');
  const [selectedAthleteId, setSelectedAthleteId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Requerimiento 4: Frecuencia semanal y turnos por día
  const [frequencyPerWeek, setFrequencyPerWeek] = useState<number>(3);
  const [sessionsPerDay, setSessionsPerDay] = useState<number>(1);

  // Rutinas del Plan
  const [routines, setRoutines] = useState<RoutineFormState[]>([]);

  // Requerimiento 2: Historial de planes asignados al alumno
  const [athletePlans, setAthletePlans] = useState<TrainingPlan[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Estado del acordeón del historial (por defecto colapsado)
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(false);

  // Requerimiento 3: Validación de superposición de fechas
  const [dateOverlapWarning, setDateOverlapWarning] = useState<string | null>(null);

  // El selector nativo no puede mostrar imágenes dentro de cada opción. Mostramos
  // el avatar del atleta elegido junto al campo.
  const selectedAthlete = athletes.find((athlete) => athlete.id === selectedAthleteId);
  const selectedAthleteAvatar = selectedAthlete?.avatarUrl ||
    (selectedAthlete
      ? `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedAthlete.fullName)}&background=eed8c0&color=5a0505&bold=true`
      : '');

  // Modal para Cargar Plantilla (HU-12)
  const [isLoadModalOpen, setIsLoadModalOpen] = useState(false);
  const [activeRoutineIdxForTemplate, setActiveRoutineIdxForTemplate] = useState(0);

  // Modal para Guardar Plantilla (HU-12)
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [templateSaveName, setTemplateSaveName] = useState('');
  const [templateSaveDescription, setTemplateSaveDescription] = useState('');
  const [templateSaveCategory, setTemplateSaveCategory] = useState('Fuerza e Hipertrofia');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  /* Controla la ventana de confirmación antes de guardar/asignar el plan */
  const [isConfirmSavePlanOpen, setIsConfirmSavePlanOpen] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setIsLoadingData(true);
    try {
      const [athletesList, exercisesList, templatesList] = await Promise.all([
        authService.getAthletes(),
        trainingService.getExercises(),
        trainingService.getTemplates(),
      ]);

      setAthletes(athletesList);
      setExercises(exercisesList);
      setTemplates(templatesList);

      if (athletesList.length > 0) {
        setSelectedAthleteId(athletesList[0].id);
      }
    } catch (err: any) {
      setErrorMessage('Error al cargar la lista de alumnos o ejercicios.');
    } finally {
      setIsLoadingData(false);
    }
  };

  // Cargar historial de planes cada vez que cambia el atleta seleccionado
  useEffect(() => {
    if (!selectedAthleteId) return;
    loadAthleteHistory(selectedAthleteId);
  }, [selectedAthleteId]);

  const loadAthleteHistory = async (athleteId: string) => {
    if (!athleteId) return;
    setIsLoadingHistory(true);
    try {
      const plans = await trainingService.getAllPlansByAthlete(athleteId);
      setAthletePlans(plans || []);
      // Colapsar el historial al cambiar de atleta para una vista limpia
      setIsHistoryExpanded(false);
    } catch (err: any) {
      console.error('Error al cargar historial de planes:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // Requerimiento 3: Comprobación reactiva de superposición de fechas
  const checkDateOverlap = (
    start: string,
    end: string,
    athleteId: string,
    currentPlanId?: string | null,
  ): string | null => {
    if (!start || !end || !athleteId) return null;
    if (end < start) return null;

    const sDate = start.slice(0, 10);
    const eDate = end.slice(0, 10);
    const todayStr = new Date().toISOString().slice(0, 10);

    const conflictingPlan = athletePlans.find((plan) => {
      // Excluir la rutina que se está modificando en este momento
      if (currentPlanId && plan.id === currentPlanId) return false;

      const pStart = String(plan.startDate).slice(0, 10);
      const pEnd = String(plan.endDate).slice(0, 10);

      // Rutina activa o programada: isActive=true o fecha fin no vencida o fecha inicio futura
      const isCurrentOrUpcoming = plan.isActive || pEnd >= todayStr || pStart >= todayStr;
      if (!isCurrentOrUpcoming) return false;

      // Superposición de rangos: [sDate, eDate] y [pStart, pEnd]
      return sDate <= pEnd && eDate >= pStart;
    });

    if (conflictingPlan) {
      return `El alumno ya tiene una rutina asignada en el rango de fechas seleccionado ("${conflictingPlan.name}": ${formatDisplayDate(conflictingPlan.startDate)} al ${formatDisplayDate(conflictingPlan.endDate)}).`;
    }
    return null;
  };

  useEffect(() => {
    if (!startDate || !endDate || !selectedAthleteId) {
      setDateOverlapWarning(null);
      return;
    }
    const warning = checkDateOverlap(startDate, endDate, selectedAthleteId, editingPlanId);
    setDateOverlapWarning(warning);
  }, [startDate, endDate, selectedAthleteId, editingPlanId, athletePlans]);

  // Requerimiento 1: Limpieza de Formulario al Asignar (Creación Limpia)
  const resetForm = () => {
    setEditingPlanId(null);
    setPlanName('');
    setStartDate('');
    setEndDate('');
    setFrequencyPerWeek(3);
    setSessionsPerDay(1);
    setRoutines([]);
    setDateOverlapWarning(null);
  };

  // Requerimiento 2: Cargar datos de una rutina del historial para visualizar/editar
  const handleLoadPlanIntoDesigner = (plan: TrainingPlan) => {
    setEditingPlanId(plan.id);
    setPlanName(plan.name);
    setStartDate(String(plan.startDate).slice(0, 10));
    setEndDate(String(plan.endDate).slice(0, 10));
    setFrequencyPerWeek(plan.frequencyPerWeek ?? 3);
    setSessionsPerDay(plan.sessionsPerDay ?? 1);
    setRoutines(
      (plan.routines || []).map((routine) => ({
        name: routine.name,
        dayOfWeek: Number(routine.dayOfWeek),
        description: routine.description || '',
        exerciseItems: (routine.exerciseItems || []).map((item) => ({
          exerciseId: item.exerciseId,
          exerciseName: item.exerciseName,
          targetSets: Number(item.targetSets),
          targetReps: Number(item.targetReps),
          targetWeightKg: Number(item.targetWeightKg),
          restSeconds: Number(item.restSeconds) || 90,
          notes: item.notes || '',
          cadence: item.cadence || '3-0-1-0',
        })),
      })),
    );
    setSuccessMessage(
      `📋 Rutina "${plan.name}" cargada en el diseñador para visualización y edición.`,
    );

    // Scroll hacia el formulario del diseñador
    const formElement = document.querySelector('.plan-builder-form');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Determinar badge de estado del plan
  const getPlanStatus = (plan: TrainingPlan) => {
    const today = new Date().toISOString().slice(0, 10);
    const start = String(plan.startDate).slice(0, 10);
    const end = String(plan.endDate).slice(0, 10);

    if (today < start) {
      return {
        label: 'Programado',
        className: 'plan-status-badge badge-scheduled',
      };
    }
    if (today > end) {
      return {
        label: 'Finalizado',
        className: 'plan-status-badge badge-finished',
      };
    }
    return {
      label: 'En Curso',
      className: 'plan-status-badge badge-in-progress',
    };
  };

  // Planes ordenados cronológicamente: de más reciente a más antiguo
  const sortedPlans = [...athletePlans].sort((a, b) => {
    const dateA = new Date(a.startDate).getTime();
    const dateB = new Date(b.startDate).getTime();
    return dateB - dateA;
  });

  const handleAddRoutine = () => {
    const nextDay = (routines.length * 2 + 1) % 7 || 5;
    setRoutines([
      ...routines,
      {
        name: `Día ${routines.length + 1}: Sesión Personalizada`,
        dayOfWeek: nextDay,
        description: '',
        exerciseItems: [],
      },
    ]);
  };

  const handleRemoveRoutine = (index: number) => {
    setRoutines(routines.filter((_, i) => i !== index));
  };

  const handleRoutineFieldChange = (
    index: number,
    field: keyof RoutineFormState,
    value: any,
  ) => {
    setRoutines((prev) =>
      prev.map((r, i) => (i === index ? { ...r, [field]: value } : r)),
    );
  };

  const handleAddExerciseToRoutine = (routineIndex: number) => {
    if (exercises.length === 0) return;
    const defaultEx = exercises[0];
    setRoutines((prev) =>
      prev.map((r, i) => {
        if (i === routineIndex) {
          return {
            ...r,
            exerciseItems: [
              ...r.exerciseItems,
              {
                exerciseId: defaultEx.id,
                exerciseName: defaultEx.nombre,
                targetSets: 3,
                targetReps: 10,
                targetWeightKg: 50,
                restSeconds: 90,
                notes: '',
                cadence: '2-0-1-0',
              },
            ],
          };
        }
        return r;
      }),
    );
  };

  const handleRemoveExerciseFromRoutine = (
    routineIndex: number,
    itemIndex: number,
  ) => {
    setRoutines((prev) =>
      prev.map((r, i) => {
        if (i === routineIndex) {
          return {
            ...r,
            exerciseItems: r.exerciseItems.filter((_, idx) => idx !== itemIndex),
          };
        }
        return r;
      }),
    );
  };

  const handleExerciseChange = (
    routineIndex: number,
    itemIndex: number,
    exerciseId: string,
  ) => {
    const found = exercises.find((e) => e.id === exerciseId);
    if (!found) return;

    setRoutines((prev) =>
      prev.map((r, i) => {
        if (i === routineIndex) {
          return {
            ...r,
            exerciseItems: r.exerciseItems.map((item, idx) =>
              idx === itemIndex
                ? {
                    ...item,
                    exerciseId: found.id,
                    exerciseName: found.nombre,
                  }
                : item,
            ),
          };
        }
        return r;
      }),
    );
  };

  const handleExerciseNumericChange = (
    routineIndex: number,
    itemIndex: number,
    field: string,
    value: any,
  ) => {
    setRoutines((prev) =>
      prev.map((r, i) => {
        if (i === routineIndex) {
          return {
            ...r,
            exerciseItems: r.exerciseItems.map((item, idx) =>
              idx === itemIndex ? { ...item, [field]: value } : item,
            ),
          };
        }
        return r;
      }),
    );
  };

  // HU-12: Cargar una plantilla en la rutina actual
  const handleApplyTemplate = (template: RoutineTemplate) => {
    setRoutines((prev) =>
      prev.map((r, i) => {
        if (i === activeRoutineIdxForTemplate) {
          return {
            ...r,
            name: template.name,
            description: template.description || r.description,
            exerciseItems: template.exerciseItems.map((item) => ({
              exerciseId: item.exerciseId,
              exerciseName: item.exerciseName,
              targetSets: item.targetSets || 3,
              targetReps: item.targetReps || 10,
              targetWeightKg: item.targetWeightKg || 50,
              restSeconds: item.restSeconds || 90,
              notes: item.notes || '',
              cadence: item.cadence || '3-0-1-0',
            })),
          };
        }
        return r;
      }),
    );
    setIsLoadModalOpen(false);
    setSuccessMessage(`✅ Plantilla "${template.name}" cargada en la rutina.`);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  // HU-12: Guardar rutina actual como nueva plantilla
  const handleOpenSaveTemplateModal = (routineIdx: number) => {
    setActiveRoutineIdxForTemplate(routineIdx);
    const routine = routines[routineIdx];
    setTemplateSaveName(routine?.name || 'Mi Nueva Plantilla');
    setTemplateSaveDescription(routine?.description || '');
    setTemplateSaveCategory('Fuerza e Hipertrofia');
    setIsSaveModalOpen(true);
  };

  const handleConfirmSaveTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    const routine = routines[activeRoutineIdxForTemplate];
    if (!routine || routine.exerciseItems.length === 0) {
      alert('La rutina debe contener al menos un ejercicio para guardarse como plantilla.');
      return;
    }

    try {
      const created = await trainingService.createTemplate({
        name: templateSaveName.trim() || routine.name,
        description: templateSaveDescription.trim() || undefined,
        category: templateSaveCategory,
        exerciseItems: routine.exerciseItems.map((it) => ({
          exerciseId: it.exerciseId,
          exerciseName: it.exerciseName,
          targetSets: Number(it.targetSets) || 3,
          targetReps: Number(it.targetReps) || 10,
          targetWeightKg: Number(it.targetWeightKg) || 0,
          restSeconds: Number(it.restSeconds) || 90,
          notes: it.notes || '',
          cadence: it.cadence || '3-0-1-0',
        })),
      });

      setTemplates((prev) => [...prev, created]);
      setIsSaveModalOpen(false);
      setSuccessMessage(`✅ Plantilla "${created.name}" guardada en la biblioteca.`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al guardar la plantilla.');
    }
  };

  /* Muestra un error y lleva al entrenador hasta el aviso */
  const showPlanError = (message: string) => {
    setErrorMessage(message);
    setTimeout(() => {
      document.querySelector('.alert-error')?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }, 0);
  };

  // Submit: Crear o Actualizar plan
  const handleSubmitPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!planName.trim()) {
      showPlanError('Debes indicar un nombre para el plan de entrenamiento.');
      return;
    }

    if (!selectedAthleteId) {
      showPlanError('Debes seleccionar un atleta de tu lista de alumnos.');
      return;
    }

    if (!startDate || !endDate) {
      showPlanError('Debes indicar las fechas de inicio y finalización del plan.');
      return;
    }

    if (endDate < startDate) {
      showPlanError('La fecha de finalización no puede ser anterior a la fecha de inicio.');
      return;
    }

    // Validación de superposición de fechas en frontend (Requerimiento 3)
    const overlap = checkDateOverlap(startDate, endDate, selectedAthleteId, editingPlanId);
    if (overlap) {
      showPlanError(overlap);
      return;
    }

    if (routines.length === 0) {
      showPlanError('Debes añadir al menos un día o rutina al plan.');
      return;
    }

    /* Busca la primera rutina que no tenga ejercicios */
    const emptyRoutineIndex = routines.findIndex(
      (routine) => routine.exerciseItems.length === 0,
    );

    if (emptyRoutineIndex !== -1) {
      const emptyRoutine = routines[emptyRoutineIndex];
      showPlanError(
        `La rutina "${emptyRoutine.name || `Día ${emptyRoutineIndex + 1}`}" está vacía. Debes agregar al menos un ejercicio antes de guardar el plan.`,
      );
      return;
    }

    /* Si no encontró errores, muestra la ventana de confirmación */
    setIsConfirmSavePlanOpen(true);
  };

  /* Guarda o actualiza el plan después de que el entrenador confirma */
  const handleConfirmSavePlan = async () => {
    setIsSubmitting(true);
    setErrorMessage('');
    try {
      const payload = {
        name: planName.trim(),
        athleteId: selectedAthleteId,
        startDate,
        endDate,
        frequencyPerWeek: Number(frequencyPerWeek) || 3,
        sessionsPerDay: Number(sessionsPerDay) || 1,
        routines: routines.map((r) => ({
          name: r.name.trim(),
          dayOfWeek: Number(r.dayOfWeek),
          description: r.description.trim(),
          exerciseItems: r.exerciseItems.map((item) => ({
            exerciseId: item.exerciseId,
            exerciseName: item.exerciseName,
            targetSets: Number(item.targetSets),
            targetReps: Number(item.targetReps),
            targetWeightKg: Number(item.targetWeightKg),
            restSeconds: Number(item.restSeconds),
            notes: item.notes.trim(),
            cadence: item.cadence?.trim() || '3-0-1-0',
          })),
        })),
      };

      if (editingPlanId) {
        await trainingService.updatePlan(editingPlanId, payload);
        setSuccessMessage(
          '🎉 ¡Plan de entrenamiento actualizado con éxito! El formulario se ha restablecido a su estado en blanco.',
        );
      } else {
        await trainingService.createPlan(payload);
        setSuccessMessage(
          '🎉 ¡Plan de entrenamiento creado y asignado con éxito! El formulario se ha limpiado automáticamente para una nueva creación.',
        );
      }

      setIsConfirmSavePlanOpen(false);

      // Requerimiento 1: Limpieza automática de formulario a estado en blanco
      resetForm();

      // Recargar historial del alumno para reflejar el cambio de inmediato
      await loadAthleteHistory(selectedAthleteId);

      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.message ||
          'Ocurrió un error al persistir el plan de entrenamiento.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingData) {
    return (
      <div className="fullscreen-loading">
        <div className="spinner"></div>
        <p>Cargando catálogo oficial y lista de atletas...</p>
      </div>
    );
  }

  return (
    <div className="trainer-plan-builder-container">
      {/* Header Banner */}
      <div className="builder-header-banner">
        <div>
          <div className="badge-pill-orange">
            <Layers size={14} />
            <span>Prescripción de Entrenamiento</span>
          </div>
          <h1 className="builder-title">Diseñador y Asignador de Planes</h1>
          <p className="builder-subtitle">
            Estructura microciclos por días, rutinas, series objetivo, pausas y notas técnicas de cadencia.
          </p>
        </div>
      </div>

      {/* Alertas */}
      {errorMessage && (
        <div className="alert-box alert-error">
          <AlertCircle size={20} />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="alert-box alert-success">
          <CheckCircle size={20} />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Requerimiento 2: Historial de Planes / Rutinas por Alumno — Acordeón colapsable */}
      <div className="builder-section card-glass athlete-history-section">
        {/* Cabecera del acordeón — siempre visible */}
        <div
          className="history-accordion-header"
          onClick={() => setIsHistoryExpanded((prev) => !prev)}
          role="button"
          tabIndex={0}
          aria-expanded={isHistoryExpanded}
          title={isHistoryExpanded ? 'Colapsar historial' : 'Expandir historial de planes'}
        >
          <div className="history-accordion-title-block">
            <div className="section-title">
              <History size={18} />
              <span>Historial de Planes Asignados</span>
              <span className="history-count-badge">{athletePlans.length}</span>
            </div>
            <p className="section-desc history-accordion-subtitle">
              {isHistoryExpanded
                ? 'Haz clic para colapsar el historial.'
                : `${athletePlans.length === 0 ? 'Sin planes previos.' : `${athletePlans.length} ${athletePlans.length === 1 ? 'plan registrado' : 'planes registrados'}.`} Expandir para ver y editar rutinas asignadas.`}
            </p>
          </div>
          <div className="history-accordion-controls">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); resetForm(); }}
              className="btn btn-secondary btn-with-icon btn-sm"
              title="Limpiar el formulario para diseñar un nuevo plan en blanco"
            >
              <Plus size={14} />
              <span>Nueva Rutina</span>
            </button>
            <span className="history-chevron">
              {isHistoryExpanded
                ? <ChevronUp size={20} />
                : <ChevronDown size={20} />}
            </span>
          </div>
        </div>

        {/* Contenido del acordeón — visible solo cuando está expandido */}
        {isHistoryExpanded && (
          <div className="history-accordion-body">
            {isLoadingHistory ? (
              <div className="history-loading-box">
                <div className="spinner"></div>
                <span>Cargando historial de rutinas del alumno...</span>
              </div>
            ) : athletePlans.length === 0 ? (
              <div className="empty-routines-placeholder">
                <FileText size={32} className="text-muted" />
                <p>Este alumno aún no cuenta con rutinas ni planes asignados previamente.</p>
                <span className="text-muted-sm">Completa el diseñador a continuación para asignarle su primer plan.</span>
              </div>
            ) : (
              <div className="plan-history-grid">
                {sortedPlans.map((plan) => {
                  const status = getPlanStatus(plan);
                  const isCurrentlyLoaded = editingPlanId === plan.id;
                  const totalExercises = (plan.routines || []).reduce(
                    (acc, r) => acc + (r.exerciseItems?.length || 0),
                    0,
                  );

                  return (
                    <div
                      key={plan.id}
                      className={`plan-history-card ${isCurrentlyLoaded ? 'active-editing' : ''}`}
                      onClick={() => handleLoadPlanIntoDesigner(plan)}
                      role="button"
                      tabIndex={0}
                      title="Haz clic para cargar y modificar esta rutina en el diseñador"
                    >
                      <div className="history-card-top">
                        <span className={status.className}>
                          {status.label === 'En Curso' && <CheckCircle size={12} />}
                          {status.label === 'Programado' && <Calendar size={12} />}
                          {status.label === 'Finalizado' && <Clock size={12} />}
                          {status.label}
                        </span>
                        {isCurrentlyLoaded && (
                          <span className="badge-editing-pill">
                            <Edit3 size={11} />
                            Cargada en Diseñador
                          </span>
                        )}
                      </div>

                      <h4 className="history-plan-name">{plan.name}</h4>

                      <div className="history-meta-details">
                        <div className="history-meta-item">
                          <Calendar size={13} />
                          <span>
                            {formatDisplayDate(plan.startDate)} al {formatDisplayDate(plan.endDate)}
                          </span>
                        </div>
                        <div className="history-meta-item">
                          <Dumbbell size={13} />
                          <span>
                            {plan.routines.length} {plan.routines.length === 1 ? 'rutina' : 'rutinas'} ({totalExercises} ejercicios)
                          </span>
                        </div>
                        <div className="history-meta-item">
                          <Clock size={13} />
                          <span>
                            Frecuencia: {plan.frequencyPerWeek ?? 3} d/sem · {plan.sessionsPerDay ?? 1} turno(s)/día
                          </span>
                        </div>
                      </div>

                      <div className="history-card-footer">
                        <span className="history-action-hint">
                          {isCurrentlyLoaded ? '✓ Visualizando y editando' : 'Cargar en diseñador →'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmitPlan} className="plan-builder-form">
        {/* Banner de Modo Edición */}
        {editingPlanId && (
          <div className="alert-box alert-info editing-banner">
            <div className="editing-banner-text">
              <Edit3 size={18} />
              <span>
                <strong>Modo Edición:</strong> Modificando la rutina <em>"{planName}"</em>. Al guardar, se actualizarán los datos existentes.
              </span>
            </div>
            <button
              type="button"
              onClick={resetForm}
              className="btn-cancel-edit"
              title="Cancelar la edición actual y empezar una nueva rutina en blanco"
            >
              Cancelar edición y crear nuevo
            </button>
          </div>
        )}

        {/* 1. Parámetros del Plan y Asignación */}
        <div className="builder-section card-glass">
          <div className="section-header-flex">
            <h2 className="section-title">
              <User size={18} />
              <span>1. Parámetros del Plan y Asignación</span>
            </h2>
            {editingPlanId && (
              <button
                type="button"
                onClick={resetForm}
                className="btn btn-secondary btn-with-icon"
                title="Limpiar formulario"
              >
                <RotateCcw size={14} />
                <span>Limpiar Formulario</span>
              </button>
            )}
          </div>

          <div className="form-grid-3">
            <div className="form-group span-2">
              <label className="form-label">Nombre del Plan / Microciclo *</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="ej. Bloque de Hipertrofia & Fuerza Fase 1"
                value={planName}
                onChange={(e) => setPlanName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Alumno / Atleta Asignado *</label>
              <div className="athlete-select-with-avatar">
                <select
                  required
                  className="form-input form-select"
                  value={selectedAthleteId}
                  onChange={(e) => setSelectedAthleteId(e.target.value)}
                >
                  {athletes.length === 0 ? (
                    <option value="">No hay atletas registrados</option>
                  ) : (
                    athletes.map((ath) => (
                      <option key={ath.id} value={ath.id}>
                        {ath.fullName} ({ath.email})
                      </option>
                    ))
                  )}
                </select>
                {selectedAthlete && (
                  <img
                    className="selected-athlete-avatar"
                    src={selectedAthleteAvatar}
                    alt={`Foto de ${selectedAthlete.fullName}`}
                    title={selectedAthlete.fullName}
                  />
                )}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Fecha de Inicio *</label>
              <input
                type="date"
                required
                className="form-input"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Fecha de Finalización *</label>
              <input
                type="date"
                required
                className="form-input"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            {/* Requerimiento 4: Frecuencia semanal y turnos por día */}
            <div className="form-group">
              <label className="form-label">Días / Frecuencia por semana *</label>
              <select
                className="form-input form-select"
                value={frequencyPerWeek}
                onChange={(e) => setFrequencyPerWeek(Number(e.target.value))}
              >
                <option value={1}>1 día por semana</option>
                <option value={2}>2 días por semana</option>
                <option value={3}>3 días por semana (Frecuencia Estándar)</option>
                <option value={4}>4 días por semana</option>
                <option value={5}>5 días por semana</option>
                <option value={6}>6 días por semana</option>
                <option value={7}>7 días por semana (Diario)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Sesiones / Turnos por día *</label>
              <select
                className="form-input form-select"
                value={sessionsPerDay}
                onChange={(e) => setSessionsPerDay(Number(e.target.value))}
              >
                <option value={1}>1 sesión / turno por día (Estándar)</option>
                <option value={2}>2 sesiones / turnos por día (Doble turno)</option>
                <option value={3}>3 sesiones por día</option>
                <option value={4}>4 sesiones por día</option>
              </select>
            </div>
          </div>

          {/* Requerimiento 3: Alerta preventiva de superposición de fechas */}
          {dateOverlapWarning && (
            <div className="alert-box alert-warning mt-3">
              <AlertTriangle size={18} />
              <span>{dateOverlapWarning}</span>
            </div>
          )}
        </div>

        {/* 2. Rutinas y Ejercicios Prescritos */}
        <div className="builder-section card-glass">
          <div className="section-header-flex">
            <div>
              <h2 className="section-title">
                <Dumbbell size={18} />
                <span>2. Rutinas y Ejercicios Prescritos ({routines.length} Rutinas)</span>
              </h2>
              <p className="section-desc">
                Define los ejercicios, descansos y tempos para cada sesión. Puedes reutilizar plantillas prediseñadas.
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddRoutine}
              className="btn btn-secondary btn-with-icon"
            >
              <Plus size={16} />
              <span>Añadir Día / Rutina</span>
            </button>
          </div>

          {routines.length === 0 ? (
            <div className="empty-routines-placeholder">
              <Dumbbell size={36} className="text-muted" />
              <p>El diseñador se encuentra actualmente en blanco (sin rutinas añadidas).</p>
              <span className="text-muted-sm">
                Haz clic en <strong>"+ Añadir Día / Rutina"</strong> para crear una sesión o carga una plantilla predefinida.
              </span>
              <button
                type="button"
                onClick={handleAddRoutine}
                className="btn btn-primary btn-with-icon mt-2"
              >
                <Plus size={16} />
                <span>Añadir Primer Día / Rutina</span>
              </button>
            </div>
          ) : (
            <div className="routines-stack">
              {routines.map((routine, rIdx) => (
                <div key={rIdx} className="routine-builder-card">
                  <div className="routine-card-top">
                    <div className="routine-title-inputs">
                      <input
                        type="text"
                        className="form-input routine-name-input"
                        value={routine.name}
                        placeholder="Nombre de la Rutina (ej. Día 1: Pecho)"
                        onChange={(e) =>
                          handleRoutineFieldChange(rIdx, 'name', e.target.value)
                        }
                      />
                      <select
                        className="form-input day-select"
                        value={routine.dayOfWeek}
                        onChange={(e) =>
                          handleRoutineFieldChange(
                            rIdx,
                            'dayOfWeek',
                            Number(e.target.value),
                          )
                        }
                      >
                        <option value={1}>Lunes</option>
                        <option value={2}>Martes</option>
                        <option value={3}>Miércoles</option>
                        <option value={4}>Jueves</option>
                        <option value={5}>Viernes</option>
                        <option value={6}>Sábado</option>
                        <option value={7}>Domingo</option>
                      </select>
                    </div>

                    {/* Acciones de Plantilla (HU-12) */}
                    <div className="routine-template-actions">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveRoutineIdxForTemplate(rIdx);
                          setIsLoadModalOpen(true);
                        }}
                        className="btn-template-action load"
                        title="Cargar una plantilla de rutina predefinida"
                      >
                        <FileDown size={14} />
                        <span>Cargar Plantilla</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenSaveTemplateModal(rIdx)}
                        className="btn-template-action save"
                        title="Guardar esta rutina como plantilla reutilizable"
                      >
                        <Bookmark size={14} />
                        <span>Guardar Plantilla</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRemoveRoutine(rIdx)}
                        className="btn-danger-icon"
                        title="Eliminar rutina"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Lista de Ejercicios en esta rutina */}
                  <div className="routine-exercises-sublist">
                    {routine.exerciseItems.length === 0 ? (
                      <div className="empty-catalog-box">
                        <p className="text-muted">No has añadido ejercicios a esta rutina todavía.</p>
                      </div>
                    ) : (
                      <table className="builder-table">
                        <thead>
                          <tr>
                            <th>Ejercicio Oficial</th>
                            <th>Series</th>
                            <th>Reps</th>
                            <th>Carga (kg)</th>
                            <th>Descanso (s)</th>
                            <th>Tempo / Cadencia</th>
                            <th>Notas Técnicas</th>
                            <th></th>
                          </tr>
                        </thead>
                        <tbody>
                          {routine.exerciseItems.map((item, exIdx) => (
                            <tr key={exIdx}>
                              <td style={{ minWidth: 200 }}>
                                <select
                                  className="table-input"
                                  value={item.exerciseId}
                                  onChange={(e) =>
                                    handleExerciseChange(rIdx, exIdx, e.target.value)
                                  }
                                >
                                  {exercises.map((ex) => (
                                    <option key={ex.id} value={ex.id}>
                                      {ex.nombre} ({ex.grupoMuscularPrincipal})
                                    </option>
                                  ))}
                                </select>
                              </td>
                              <td style={{ width: 75 }}>
                                <input
                                  type="number"
                                  min="1"
                                  className="table-input num-input"
                                  value={item.targetSets}
                                  onChange={(e) =>
                                    handleExerciseNumericChange(
                                      rIdx,
                                      exIdx,
                                      'targetSets',
                                      e.target.value,
                                    )
                                  }
                                />
                              </td>
                              <td style={{ width: 75 }}>
                                <input
                                  type="number"
                                  min="1"
                                  className="table-input num-input"
                                  value={item.targetReps}
                                  onChange={(e) =>
                                    handleExerciseNumericChange(
                                      rIdx,
                                      exIdx,
                                      'targetReps',
                                      e.target.value,
                                    )
                                  }
                                />
                              </td>
                              <td style={{ width: 90 }}>
                                <input
                                  type="number"
                                  step="0.5"
                                  min="0"
                                  className="table-input num-input"
                                  value={item.targetWeightKg}
                                  onChange={(e) =>
                                    handleExerciseNumericChange(
                                      rIdx,
                                      exIdx,
                                      'targetWeightKg',
                                      e.target.value,
                                    )
                                  }
                                />
                              </td>
                              <td style={{ width: 85 }}>
                                <input
                                  type="number"
                                  step="5"
                                  min="0"
                                  className="table-input num-input"
                                  value={item.restSeconds}
                                  onChange={(e) =>
                                    handleExerciseNumericChange(
                                      rIdx,
                                      exIdx,
                                      'restSeconds',
                                      e.target.value,
                                    )
                                  }
                                />
                              </td>
                              <td style={{ width: 110 }}>
                                <input
                                  type="text"
                                  className="table-input text-input"
                                  placeholder="3-0-1-0"
                                  value={item.cadence || ''}
                                  onChange={(e) =>
                                    handleExerciseNumericChange(
                                      rIdx,
                                      exIdx,
                                      'cadence',
                                      e.target.value,
                                    )
                                  }
                                />
                              </td>
                              <td>
                                <input
                                  type="text"
                                  className="table-input text-input"
                                  placeholder="ej. Retracción escapular activa"
                                  value={item.notes}
                                  onChange={(e) =>
                                    handleExerciseNumericChange(
                                      rIdx,
                                      exIdx,
                                      'notes',
                                      e.target.value,
                                    )
                                  }
                                />
                              </td>
                              <td style={{ width: 40, textAlign: 'center' }}>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleRemoveExerciseFromRoutine(rIdx, exIdx)
                                  }
                                  className="btn-remove-row"
                                  title="Quitar ejercicio"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}

                    <button
                      type="button"
                      onClick={() => handleAddExerciseToRoutine(rIdx)}
                      className="btn-add-exercise-row"
                    >
                      <Plus size={14} />
                      <span>Añadir Movimiento a este Día</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Barra Flotante de Publicación */}
        <div className="builder-publish-bar card-glass">
          <div className="publish-info-box">
            <span className="publish-badge">
              {editingPlanId ? 'Modificando Plan Existente' : 'Asignación de Nuevo Plan'}
            </span>
            <p className="publish-desc">
              {editingPlanId
                ? 'Al confirmar, se actualizarán los datos de la rutina en el perfil del alumno.'
                : 'Al asignar, este plan se guardará y el formulario volverá a un estado en blanco.'}
            </p>
          </div>
          <div className="publish-actions-row">
            <button
              type="button"
              onClick={resetForm}
              className="btn btn-secondary btn-with-icon"
              disabled={isSubmitting}
              title="Limpiar campos y rutinas para empezar de cero"
            >
              <RotateCcw size={16} />
              <span>Limpiar Formulario</span>
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !!dateOverlapWarning}
              className="btn btn-primary btn-large btn-save-plan"
            >
              <Save size={18} />
              <span>
                {isSubmitting
                  ? 'Guardando...'
                  : editingPlanId
                  ? 'Actualizar Plan'
                  : 'Asignar Plan'}
              </span>
            </button>
          </div>
        </div>
      </form>

      {/* Confirmación antes de guardar/asignar el plan */}
      {isConfirmSavePlanOpen && (
        <div
          className="modal-backdrop"
          onClick={() => {
            if (!isSubmitting) {
              setIsConfirmSavePlanOpen(false);
            }
          }}
        >
          <div
            className="modal-container modal-sm finish-confirm-card"
            onClick={(e) => e.stopPropagation()}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-save-plan-title"
          >
            <div className="modal-header">
              <div className="modal-title-group">
                <Save size={20} className="text-primary" />
                <h3 id="confirm-save-plan-title" className="modal-title">
                  {editingPlanId ? 'Actualizar plan asignado' : 'Asignar nuevo plan'}
                </h3>
              </div>

              <button
                type="button"
                className="btn-icon-close"
                onClick={() => setIsConfirmSavePlanOpen(false)}
                disabled={isSubmitting}
                aria-label="Cerrar confirmación"
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-body-content">
              <div className="finish-confirm-body">
                <div className="finish-confirm-icon-box">
                  <Dumbbell size={36} className="text-primary" />
                </div>

                <h4 className="finish-confirm-heading">
                  {editingPlanId
                    ? '¿Confirmás la actualización de esta rutina?'
                    : '¿Confirmás la asignación del plan?'}
                </h4>

                <p className="finish-confirm-text">
                  El plan <strong>"{planName}"</strong> se guardará para{' '}
                  <strong>{selectedAthlete?.fullName || 'el alumno seleccionado'}</strong>{' '}
                  desde el <strong>{formatDisplayDate(startDate)}</strong> hasta el{' '}
                  <strong>{formatDisplayDate(endDate)}</strong> ({frequencyPerWeek} días/sem, {sessionsPerDay} turno/día).
                </p>

                <div className="finish-confirm-badge-summary">
                  <span>
                    Rutinas: <strong>{routines.length}</strong>
                    {' · '}
                    Ejercicios:{' '}
                    <strong>
                      {routines.reduce(
                        (total, routine) => total + routine.exerciseItems.length,
                        0,
                      )}
                    </strong>
                  </span>
                </div>
              </div>
            </div>

            <div className="modal-footer finish-confirm-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setIsConfirmSavePlanOpen(false)}
                disabled={isSubmitting}
              >
                Cancelar y revisar
              </button>

              <button
                type="button"
                className="btn btn-primary"
                onClick={handleConfirmSavePlan}
                disabled={isSubmitting}
              >
                <CheckCircle size={16} />
                <span>
                  {isSubmitting
                    ? 'Guardando...'
                    : editingPlanId
                    ? 'Confirmar y actualizar'
                    : 'Confirmar y asignar'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Cargar Plantilla (HU-12) */}
      {isLoadModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-container">
            <div className="modal-header">
              <div className="modal-title-box">
                <FileDown size={20} className="modal-icon primary" />
                <h2>Cargar Plantilla Predefinida</h2>
              </div>
              <button
                onClick={() => setIsLoadModalOpen(false)}
                className="btn-close-modal"
              >
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <p className="modal-subtitle-text">
                Selecciona una plantilla para aplicar a la rutina actual:
              </p>

              {templates.length === 0 ? (
                <div className="table-empty-box">
                  <p>No hay plantillas guardadas aún en la biblioteca.</p>
                </div>
              ) : (
                <div className="template-picker-grid">
                  {templates.map((tpl) => (
                    <div
                      key={tpl.id}
                      onClick={() => handleApplyTemplate(tpl)}
                      className="template-card-choice"
                    >
                      <div className="template-choice-header">
                        <span className="template-choice-category">
                          {tpl.category || 'General'}
                        </span>
                        <span className="template-choice-count">
                          {tpl.exerciseItems.length} ejercicios
                        </span>
                      </div>
                      <h4 className="template-choice-title">{tpl.name}</h4>
                      {tpl.description && (
                        <p className="template-choice-desc">{tpl.description}</p>
                      )}
                      <div className="template-choice-footer">
                        <span>Hacer clic para aplicar &rarr;</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button
                onClick={() => setIsLoadModalOpen(false)}
                className="btn-secondary"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Guardar como Plantilla (HU-12) */}
      {isSaveModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-container modal-sm">
            <div className="modal-header">
              <div className="modal-title-box">
                <Bookmark size={20} className="modal-icon primary" />
                <h2>Guardar como Plantilla</h2>
              </div>
              <button
                onClick={() => setIsSaveModalOpen(false)}
                className="btn-close-modal"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleConfirmSaveTemplate} className="modal-form">
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Nombre de la Plantilla *</label>
                  <input
                    type="text"
                    required
                    value={templateSaveName}
                    onChange={(e) => setTemplateSaveName(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Categoría</label>
                  <select
                    value={templateSaveCategory}
                    onChange={(e) => setTemplateSaveCategory(e.target.value)}
                    className="form-input form-select"
                  >
                    <option value="Fuerza e Hipertrofia">Fuerza e Hipertrofia</option>
                    <option value="Empuje (Push)">Empuje (Push)</option>
                    <option value="Tracción (Pull)">Tracción (Pull)</option>
                    <option value="Piernas (Legs)">Piernas (Legs)</option>
                    <option value="Full Body">Full Body</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Descripción (Opcional)</label>
                  <textarea
                    rows={2}
                    value={templateSaveDescription}
                    onChange={(e) => setTemplateSaveDescription(e.target.value)}
                    className="form-input form-textarea"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setIsSaveModalOpen(false)}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  Guardar Plantilla
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
