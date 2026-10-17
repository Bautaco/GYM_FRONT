import React, { useState, useEffect } from 'react';
import {
  Plus,
  Play,
  Dumbbell,
  Search,
  CheckCircle,
  AlertCircle,
  X,
  Pencil,
  Trash2,
  Tag,
  PlusCircle,
  Sparkles,
} from 'lucide-react';
import { trainingService } from '../../services/trainingService.js';
import { useAuth } from '../auth/AuthContext.js';
import { Exercise, UserRole } from '../../types/index.js';
import { ExerciseDetailModal } from '../../components/ExerciseDetailModal.js';

const DEFAULT_MUSCLE_GROUPS = ['Piernas', 'Pecho', 'Espalda', 'Hombros', 'Brazos', 'Core'];

const emptyForm = () => ({
  nombre: '',
  grupo: 'Piernas',
  descripcion: '',
  videoUrl: '',
});

export const ExerciseCatalogPage: React.FC = () => {
  const { role } = useAuth();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [muscleGroups, setMuscleGroups] = useState<string[]>(DEFAULT_MUSCLE_GROUPS);
  const [targetZonesList, setTargetZonesList] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState<string>('TODOS');
  const [isLoading, setIsLoading] = useState(true);

  // Video & Detail modal
  const [selectedExerciseForModal, setSelectedExerciseForModal] = useState<Exercise | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Create/Edit modal
  const [editTarget, setEditTarget] = useState<Exercise | null>(null); // null = crear
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm());
  const [isCustomGroupMode, setIsCustomGroupMode] = useState(false);
  const [customGroupName, setCustomGroupName] = useState('');
  const [formSelectedZones, setFormSelectedZones] = useState<string[]>([]);
  const [newZoneInput, setNewZoneInput] = useState('');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState<Exercise | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([loadExercises(), loadMetadata()]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadExercises = async () => {
    try {
      const data = await trainingService.getExercises();
      setExercises(data);
    } catch (e) {
      console.error('Error al cargar ejercicios:', e);
    }
  };

  const loadMetadata = async () => {
    try {
      const [groups, zones] = await Promise.all([
        trainingService.getMuscleGroups().catch(() => []),
        trainingService.getTargetZones().catch(() => []),
      ]);
      if (groups && groups.length > 0) {
        setMuscleGroups(groups);
      }
      if (zones && zones.length > 0) {
        setTargetZonesList(zones);
      }
    } catch (e) {
      console.error('Error al cargar metadatos musculares:', e);
    }
  };

  const openCreateModal = () => {
    setEditTarget(null);
    setIsCustomGroupMode(false);
    setCustomGroupName('');
    setFormSelectedZones(['Cuádriceps', 'Glúteo Mayor']);
    setNewZoneInput('');
    setForm({
      nombre: '',
      grupo: muscleGroups[0] || 'Piernas',
      descripcion: '',
      videoUrl: '',
    });
    setFormError('');
    setFormSuccess('');
    setIsFormModalOpen(true);
  };

  const openEditModal = (ex: Exercise) => {
    setEditTarget(ex);
    const existsInGroups = muscleGroups.some(
      (g) => g.toLowerCase() === ex.grupoMuscularPrincipal.toLowerCase(),
    );
    if (!existsInGroups && ex.grupoMuscularPrincipal) {
      setIsCustomGroupMode(true);
      setCustomGroupName(ex.grupoMuscularPrincipal);
    } else {
      setIsCustomGroupMode(false);
      setCustomGroupName('');
    }
    setFormSelectedZones(
      ex.zonasTrabajadas && ex.zonasTrabajadas.length > 0
        ? [...ex.zonasTrabajadas]
        : [ex.grupoMuscularPrincipal],
    );
    setNewZoneInput('');
    setForm({
      nombre: ex.nombre,
      grupo: ex.grupoMuscularPrincipal,
      descripcion: ex.descripcion,
      videoUrl: ex.videoUrl || '',
    });
    setFormError('');
    setFormSuccess('');
    setIsFormModalOpen(true);
  };

  // Manejador para agregar zonas trabajadas dinámicamente
  const handleAddZone = (zoneToAdd?: string) => {
    const raw = (zoneToAdd !== undefined ? zoneToAdd : newZoneInput).trim();
    if (!raw) return;

    // Permitir separar por comas en caso de pegar varios términos
    const split = raw
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const updated = [...formSelectedZones];
    for (const item of split) {
      if (!updated.some((z) => z.toLowerCase() === item.toLowerCase())) {
        updated.push(item);
      }
    }

    setFormSelectedZones(updated);
    if (zoneToAdd === undefined) {
      setNewZoneInput('');
    }
  };

  const handleRemoveZone = (indexToRemove: number) => {
    setFormSelectedZones((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!form.nombre.trim() || !form.descripcion.trim()) {
      setFormError('El nombre y la descripción técnica son obligatorios.');
      return;
    }

    const finalGroup = isCustomGroupMode ? customGroupName.trim() : form.grupo.trim();
    if (!finalGroup) {
      setFormError('Debes seleccionar o ingresar un Grupo Muscular Principal.');
      return;
    }

    if (formSelectedZones.length === 0) {
      setFormError('Debes especificar al menos una Zona Trabajada.');
      return;
    }

    const payload = {
      nombre: form.nombre.trim(),
      grupoMuscularPrincipal: finalGroup,
      zonasTrabajadas: formSelectedZones,
      descripcion: form.descripcion.trim(),
      videoUrl: form.videoUrl.trim() || undefined,
    };

    setIsSubmitting(true);
    try {
      if (editTarget) {
        await trainingService.updateExercise(editTarget.id, payload);
        setFormSuccess('¡Ejercicio actualizado y grupos musculares sincronizados!');
      } else {
        await trainingService.createExercise(payload);
        setFormSuccess('¡Ejercicio creado y dado de alta en el catálogo con éxito!');
      }

      // Recargar catálogo y metadatos dinámicos para que las nuevas opciones queden disponibles
      await Promise.all([loadExercises(), loadMetadata()]);

      setTimeout(() => {
        setIsFormModalOpen(false);
        setFormSuccess('');
      }, 1100);
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Error al guardar el ejercicio.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setDeleteError('');
    try {
      await trainingService.deleteExercise(deleteTarget.id);
      await loadExercises();
      setDeleteTarget(null);
    } catch (err: any) {
      setDeleteError(err.response?.data?.message || 'Error al eliminar el ejercicio.');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredExercises = exercises.filter((ex) => {
    const matchesSearch =
      ex.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ex.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ex.zonasTrabajadas?.some((z) => z.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesMuscle =
      selectedMuscle === 'TODOS' ||
      ex.grupoMuscularPrincipal.toUpperCase() === selectedMuscle.toUpperCase();
    return matchesSearch && matchesMuscle;
  });

  // Filtros superiores dinámicos que se expanden automáticamente con nuevos grupos
  const dynamicCategories = ['TODOS', ...muscleGroups.map((m) => m.toUpperCase())];

  // Sugerencias de zonas para agregar con un solo clic (que no estén ya seleccionadas)
  const unselectedSuggestions = targetZonesList.filter(
    (z) => !formSelectedZones.some((sz) => sz.toLowerCase() === z.toLowerCase()),
  );

  return (
    <div className="catalog-page-layout">
      {/* Header */}
      <div className="catalog-header-row">
        <div>
          <h1 className="page-main-title">Catálogo Oficial de Ejercicios</h1>
          <p className="page-main-subtitle">
            Guía biomecánica completa con zonas musculares trabajadas dinámicas, muñeco anatómico y reproducción in-app de técnica.
          </p>
        </div>

        {role === UserRole.ENTRENADOR && (
          <button onClick={openCreateModal} className="btn btn-primary">
            <Plus size={18} />
            <span>Crear Ejercicio</span>
          </button>
        )}
      </div>

      {/* Filter and Search */}
      <div className="filter-search-container">
        <div className="search-input-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Buscar por nombre, zona muscular o descripción..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="muscle-filter-pills">
          {dynamicCategories.map((m) => (
            <button
              key={m}
              onClick={() => setSelectedMuscle(m)}
              className={`filter-pill-btn ${selectedMuscle === m ? 'active' : ''}`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Exercise Cards */}
      {isLoading ? (
        <div className="loading-state-box">
          <div className="spinner"></div>
          <p>Cargando catálogo...</p>
        </div>
      ) : filteredExercises.length === 0 ? (
        <div className="empty-catalog-box">
          <Dumbbell size={40} className="text-muted" />
          <p>No se encontraron ejercicios con los filtros seleccionados.</p>
        </div>
      ) : (
        <div className="exercises-grid">
          {filteredExercises.map((ex) => (
            <div key={ex.id} className="exercise-card">
              <div className="exercise-card-header">
                <span className="badge badge-primary">{ex.grupoMuscularPrincipal}</span>
                {ex.videoUrl ? (
                  <span className="badge badge-video">
                    <Play size={12} /> Video In-App
                  </span>
                ) : (
                  <span className="badge badge-muted">Sin Video</span>
                )}
              </div>

              <h3 className="card-exercise-name">{ex.nombre}</h3>
              <p className="card-exercise-desc">{ex.descripcion}</p>

              <div className="card-zones-box">
                <span className="zones-label">Músculos involucrados:</span>
                <div className="muscle-tags-wrap">
                  {ex.zonasTrabajadas?.map((z, idx) => (
                    <span key={idx} className="muscle-tag small">{z}</span>
                  ))}
                </div>
              </div>

              <div className="card-action-footer">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedExerciseForModal(ex);
                    setIsModalOpen(true);
                  }}
                  className="btn btn-secondary btn-block"
                >
                  <Play size={16} />
                  <span>Ver Ficha y Video</span>
                </button>

                {/* Acciones de edición solo para entrenador */}
                {role === UserRole.ENTRENADOR && (
                  <div className="card-trainer-actions">
                    <button
                      type="button"
                      onClick={() => openEditModal(ex)}
                      className="btn-card-action edit"
                      title="Editar ejercicio"
                    >
                      <Pencil size={15} />
                      <span>Editar</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(ex)}
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
      )}

      {/* Video & Detail Modal con Muñeco Anatómico (HU-07) */}
      <ExerciseDetailModal
        exercise={selectedExerciseForModal}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      {/* Create / Edit Modal con Combobox Dinámico y Creador de Tags */}
      {isFormModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsFormModalOpen(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()} role="dialog">
            <div className="modal-header">
              <h3 className="modal-title">
                {editTarget ? `Editar: ${editTarget.nombre}` : 'Dar de Alta Nuevo Ejercicio'}
              </h3>
              <button onClick={() => setIsFormModalOpen(false)} className="btn-icon-close">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="modal-body-form">
              {formError && (
                <div className="alert-box alert-error">
                  <AlertCircle size={18} />
                  <span>{formError}</span>
                </div>
              )}
              {formSuccess && (
                <div className="alert-box alert-success">
                  <CheckCircle size={18} />
                  <span>{formSuccess}</span>
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
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                />
              </div>

              {/* 1. Combobox Dinámico para Grupo Muscular Principal */}
              <div className="form-group">
                <label className="form-label">Grupo Muscular Principal *</label>
                <div className="group-select-row">
                  {!isCustomGroupMode ? (
                    <>
                      <select
                        className="form-input"
                        value={form.grupo}
                        onChange={(e) => {
                          if (e.target.value === '__NEW__') {
                            setIsCustomGroupMode(true);
                            setCustomGroupName('');
                          } else {
                            setForm({ ...form, grupo: e.target.value });
                          }
                        }}
                      >
                        {muscleGroups.map((g) => (
                          <option key={g} value={g}>
                            {g}
                          </option>
                        ))}
                        <option value="__NEW__">➕ Crear nuevo grupo muscular...</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => {
                          setIsCustomGroupMode(true);
                          setCustomGroupName('');
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
                        onChange={(e) => setCustomGroupName(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => setIsCustomGroupMode(false)}
                        className="btn btn-secondary btn-sm"
                        style={{ whiteSpace: 'nowrap' }}
                      >
                        Elegir de lista
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* 2. Zonas Trabajadas Dinámicas con Creación Sobre la Marcha */}
              <div className="form-group">
                <label className="form-label">Zonas Trabajadas / Músculos Específicos *</label>
                <div className="zone-input-row">
                  <input
                    type="text"
                    placeholder="Escribí una zona (ej. Glúteo Medio) y presioná Enter o Agregar..."
                    className="form-input"
                    value={newZoneInput}
                    onChange={(e) => setNewZoneInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddZone();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => handleAddZone()}
                    className="btn-add-tag"
                  >
                    <Plus size={15} />
                    <span>Agregar</span>
                  </button>
                </div>

                {/* Chips de Zonas Seleccionadas */}
                <div className="selected-zones-container">
                  {formSelectedZones.map((zone, idx) => (
                    <span key={idx} className="selected-zone-badge">
                      <Tag size={12} />
                      <span>{zone}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveZone(idx)}
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

                {/* Bandeja de sugerencias rápidas desde la base de datos */}
                {unselectedSuggestions.length > 0 && (
                  <div className="quick-zones-section">
                    <span className="quick-zones-title">
                      Zonas registradas en la base de datos (clic para sumar):
                    </span>
                    <div className="quick-zones-pills">
                      {unselectedSuggestions.slice(0, 16).map((zone) => (
                        <button
                          key={zone}
                          type="button"
                          onClick={() => handleAddZone(zone)}
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
                  onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">URL del Video Demostrativo (Opcional)</label>
                <input
                  type="url"
                  placeholder="https://www.youtube.com/watch?v=... o enlace directo .mp4"
                  className="form-input"
                  value={form.videoUrl}
                  onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
                />
                <span className="input-hint">
                  Podés pegar un enlace de YouTube (incluyendo Shorts) o un video directo (.mp4, .webm).
                </span>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="btn btn-secondary"
                  disabled={isSubmitting}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Guardando...' : editTarget ? 'Guardar Cambios' : 'Crear Ejercicio'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="modal-backdrop" onClick={() => setDeleteTarget(null)}>
          <div className="modal-container modal-sm" onClick={(e) => e.stopPropagation()} role="alertdialog">
            <div className="modal-header">
              <h3 className="modal-title">Confirmar Eliminación</h3>
              <button onClick={() => setDeleteTarget(null)} className="btn-icon-close">
                <X size={20} />
              </button>
            </div>
            <div className="modal-body-content">
              {deleteError && (
                <div className="alert-box alert-error" style={{ marginBottom: 16 }}>
                  <AlertCircle size={18} />
                  <span>{deleteError}</span>
                </div>
              )}
              <div className="delete-confirm-body">
                <div className="delete-confirm-icon">
                  <Trash2 size={32} />
                </div>
                <p className="delete-confirm-text">
                  ¿Estás seguro que deseas eliminar el ejercicio{' '}
                  <strong>"{deleteTarget.nombre}"</strong>? Esta acción no se puede deshacer.
                </p>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="btn btn-secondary"
                disabled={isDeleting}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="btn btn-danger"
                disabled={isDeleting}
              >
                <Trash2 size={16} />
                <span>{isDeleting ? 'Eliminando...' : 'Sí, eliminar'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
