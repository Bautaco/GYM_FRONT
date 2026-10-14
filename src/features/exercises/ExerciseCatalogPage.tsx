import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Plus,
  Play,
  Dumbbell,
  Search,
  CheckCircle,
  AlertCircle,
  X,
  Pencil,
  Trash2,
} from 'lucide-react';
import { trainingService } from '../../services/trainingService.js';
import { useAuth } from '../auth/AuthContext.js';
import { Exercise, UserRole } from '../../types/index.js';
import { VideoPlayerModal } from '../../components/VideoPlayerModal.js';

const MUSCLE_GROUPS = ['Piernas', 'Pecho', 'Espalda', 'Hombros', 'Brazos', 'Core'];

const emptyForm = () => ({
  nombre: '',
  grupo: 'Piernas',
  zonas: 'Cuádriceps, Glúteos',
  descripcion: '',
  videoUrl: '',
});

export const ExerciseCatalogPage: React.FC = () => {
  const { role } = useAuth();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState<string>('TODOS');
  const [isLoading, setIsLoading] = useState(true);

  // Video modal
  const [selectedExerciseForModal, setSelectedExerciseForModal] = useState<Exercise | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Create/Edit modal
  const [editTarget, setEditTarget] = useState<Exercise | null>(null); // null = crear
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm());
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState<Exercise | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    loadExercises();
  }, []);

  const loadExercises = async () => {
    setIsLoading(true);
    try {
      const data = await trainingService.getExercises();
      setExercises(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditTarget(null);
    setForm(emptyForm());
    setFormError('');
    setFormSuccess('');
    setIsFormModalOpen(true);
  };

  const openEditModal = (ex: Exercise) => {
    setEditTarget(ex);
    setForm({
      nombre: ex.nombre,
      grupo: ex.grupoMuscularPrincipal,
      zonas: (ex.zonasTrabajadas || []).join(', '),
      descripcion: ex.descripcion,
      videoUrl: ex.videoUrl || '',
    });
    setFormError('');
    setFormSuccess('');
    setIsFormModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!form.nombre.trim() || !form.descripcion.trim()) {
      setFormError('El nombre y la descripción técnica son obligatorios.');
      return;
    }

    const zonesArray = form.zonas
      .split(',')
      .map((z) => z.trim())
      .filter((z) => z.length > 0);

    const payload = {
      nombre: form.nombre.trim(),
      grupoMuscularPrincipal: form.grupo,
      zonasTrabajadas: zonesArray.length > 0 ? zonesArray : [form.grupo],
      descripcion: form.descripcion.trim(),
      videoUrl: form.videoUrl.trim() || undefined,
    };

    setIsSubmitting(true);
    try {
      if (editTarget) {
        await trainingService.updateExercise(editTarget.id, payload);
        setFormSuccess('¡Ejercicio actualizado correctamente!');
      } else {
        await trainingService.createExercise(payload);
        setFormSuccess('¡Ejercicio creado y dado de alta en el catálogo!');
      }
      await loadExercises();
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

  const muscleCategories = ['TODOS', ...MUSCLE_GROUPS.map((m) => m.toUpperCase())];

  return (
    <div className="catalog-page-layout">
      {/* Header */}
      <div className="catalog-header-row">
        <div>
          <h1 className="page-main-title">Catálogo Oficial de Ejercicios</h1>
          <p className="page-main-subtitle">
            Guía biomecánica completa con zonas musculares trabajadas y reproducción in-app de técnica de ejecución.
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
          {muscleCategories.map((m) => (
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

      {/* Video Modal */}
      <VideoPlayerModal
        exercise={selectedExerciseForModal}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      {/* Create / Edit Modal */}
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

              <div className="form-group">
                <label className="form-label">Grupo Muscular Principal *</label>
                <select
                  className="form-input"
                  value={form.grupo}
                  onChange={(e) => setForm({ ...form, grupo: e.target.value })}
                >
                  {MUSCLE_GROUPS.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Zonas Trabajadas (separadas por coma) *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Glúteo Mayor, Isquiotibiales, Core"
                  className="form-input"
                  value={form.zonas}
                  onChange={(e) => setForm({ ...form, zonas: e.target.value })}
                />
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
