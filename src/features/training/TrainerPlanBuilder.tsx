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
  Sparkles,
  X,
  FileText,
} from 'lucide-react';
import { trainingService } from '../../services/trainingService.js';
import { authService } from '../../services/authService.js';
import { User as AthleteUser, Exercise, RoutineTemplate } from '../../types/index.js';

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

export const TrainerPlanBuilder: React.FC = () => {
  const [athletes, setAthletes] = useState<AthleteUser[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [templates, setTemplates] = useState<RoutineTemplate[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Formulario del Plan
  const [planName, setPlanName] = useState('Mesociclo de Hipertrofia & Fuerza');
  const [selectedAthleteId, setSelectedAthleteId] = useState('');
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split('T')[0],
  );
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  );

  // Rutinas del Plan
  const [routines, setRoutines] = useState<RoutineFormState[]>([
    {
      name: 'Día 1: Piernas y Core',
      dayOfWeek: 1, // Lunes
      description: 'Enfoque en sentadilla y potencia inferior',
      exerciseItems: [],
    },
    {
      name: 'Día 2: Torso y Empuje',
      dayOfWeek: 3, // Miércoles
      description: 'Enfoque en press de banca y hombros',
      exerciseItems: [],
    },
  ]);

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

      // Si las rutinas no tienen ejercicios, precargar el primer ejercicio como guía
      if (exercisesList.length > 0) {
        const defaultEx = exercisesList[0];
        setRoutines((prev) =>
          prev.map((r) => ({
            ...r,
            exerciseItems: [
              {
                exerciseId: defaultEx.id,
                exerciseName: defaultEx.nombre,
                targetSets: 4,
                targetReps: 8,
                targetWeightKg: 60,
                restSeconds: 90,
                notes: 'Control en la fase excéntrica',
                cadence: '3-0-1-0',
              },
            ],
          })),
        );
      }
    } catch (err: any) {
      setErrorMessage('Error al cargar la lista de alumnos o ejercicios.');
    } finally {
      setIsLoadingData(false);
    }
  };

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

  // Submit HU-03: Crear y asignar plan
  const handleSubmitPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!planName.trim()) {
      setErrorMessage('Debes indicar un nombre para el plan de entrenamiento.');
      return;
    }

    if (!selectedAthleteId) {
      setErrorMessage('Debes seleccionar un atleta de tu lista de alumnos.');
      return;
    }

    if (routines.length === 0) {
      setErrorMessage('Debes añadir al menos un día o rutina al plan.');
      return;
    }

    for (let i = 0; i < routines.length; i++) {
      if (routines[i].exerciseItems.length === 0) {
        setErrorMessage(
          `La rutina "${routines[i].name || `Día ${i + 1}`}" no tiene ejercicios agregados. Añade al menos uno.`,
        );
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: planName.trim(),
        athleteId: selectedAthleteId,
        startDate,
        endDate,
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

      await trainingService.createPlan(payload);

      setSuccessMessage(
        '🎉 ¡Plan de entrenamiento creado y asignado con éxito! Se ha activado como el plan vigente para el atleta.',
      );

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
            Estructura microciclos por días, rutinas, series objetivo, pausas y notas técnicas de cadencia (HU-03 & HU-12).
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

      <form onSubmit={handleSubmitPlan} className="plan-builder-form">
        {/* Parámetros Generales */}
        <div className="builder-section card-glass">
          <h2 className="section-title">
            <User size={18} />
            <span>1. Parámetros del Plan y Asignación</span>
          </h2>

          <div className="form-grid-3">
            <div className="form-group span-2">
              <label className="form-label">Nombre del Plan / Microciclo *</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="ej. Bloque de Fuerza 5x5 - Hipertrofia Fase 1"
                value={planName}
                onChange={(e) => setPlanName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Alumno / Atleta Asignado *</label>
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
          </div>
        </div>

        {/* Bloque de Rutinas Diarias */}
        <div className="builder-section card-glass">
          <div className="section-header-flex">
            <div>
              <h2 className="section-title">
                <Dumbbell size={18} />
                <span>2. Rutinas y Ejercicios Prescritos ({routines.length} Días)</span>
              </h2>
              <p className="section-desc">
                Define los ejercicios, descansos y tempos para cada sesión. Puedes reutilizar plantillas prediseñadas (HU-12).
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

                    {routines.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveRoutine(rIdx)}
                        className="btn-danger-icon"
                        title="Eliminar rutina"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Lista de Ejercicios en esta rutina */}
                <div className="routine-exercises-sublist">
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
        </div>

        {/* Barra Flotante de Publicación */}
        <div className="builder-publish-bar card-glass">
          <div className="publish-info-box">
            <span className="publish-badge">Estado del Plan</span>
            <p className="publish-desc">
              Al guardar, este plan se activará inmediatamente como el plan vigente para el atleta.
            </p>
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary btn-large btn-save-plan"
          >
            <Save size={18} />
            <span>{isSubmitting ? 'Guardando y Asignando...' : 'Guardar y Asignar Plan'}</span>
          </button>
        </div>
      </form>

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
