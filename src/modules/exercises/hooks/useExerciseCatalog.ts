import { useEffect, useState, type FormEvent } from 'react';
import { exercisesService } from '../exercises.service.js';
import { validateExerciseForm } from '../exercises.schema.js';
import type {
  Exercise,
  ExerciseFormValues,
  ExercisePayload,
} from '../exercises.types.js';

const DEFAULT_MUSCLE_GROUPS = [
  'Piernas',
  'Pecho',
  'Espalda',
  'Hombros',
  'Brazos',
  'Core',
];

const emptyForm = (): ExerciseFormValues => ({
  nombre: '',
  grupo: 'Piernas',
  descripcion: '',
  videoUrl: '',
});

/**
 * Centraliza el estado y las acciones de la pantalla de catálogo.
 * La página obtiene aquí los datos y se concentra en componer la interfaz.
 */
export function useExerciseCatalog() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [muscleGroups, setMuscleGroups] = useState<string[]>(DEFAULT_MUSCLE_GROUPS);
  const [targetZonesList, setTargetZonesList] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState('TODOS');

  const [selectedExerciseForModal, setSelectedExerciseForModal] =
    useState<Exercise | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const [editTarget, setEditTarget] = useState<Exercise | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [form, setForm] = useState<ExerciseFormValues>(emptyForm());
  const [isCustomGroupMode, setIsCustomGroupMode] = useState(false);
  const [customGroupName, setCustomGroupName] = useState('');
  const [formSelectedZones, setFormSelectedZones] = useState<string[]>([]);
  const [newZoneInput, setNewZoneInput] = useState('');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Exercise | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    void loadAllData();
  }, []);

  async function loadExercises() {
    try {
      setExercises(await exercisesService.getExercises());
    } catch (error) {
      console.error('Error al cargar ejercicios:', error);
    }
  }

  async function loadMetadata() {
    try {
      const [groups, zones] = await Promise.all([
        exercisesService.getMuscleGroups().catch(() => []),
        exercisesService.getTargetZones().catch(() => []),
      ]);

      if (groups.length > 0) setMuscleGroups(groups);
      if (zones.length > 0) setTargetZonesList(zones);
    } catch (error) {
      console.error('Error al cargar metadatos musculares:', error);
    }
  }

  async function loadAllData() {
    setIsLoading(true);
    try {
      await Promise.all([loadExercises(), loadMetadata()]);
    } finally {
      setIsLoading(false);
    }
  }

  function openCreateModal() {
    setEditTarget(null);
    setIsCustomGroupMode(false);
    setCustomGroupName('');
    setFormSelectedZones(['Cuádriceps', 'Glúteo Mayor']);
    setNewZoneInput('');
    setForm({ ...emptyForm(), grupo: muscleGroups[0] || 'Piernas' });
    setFormError('');
    setFormSuccess('');
    setIsFormModalOpen(true);
  }

  function openEditModal(exercise: Exercise) {
    setEditTarget(exercise);
    const existsInGroups = muscleGroups.some(
      (group) =>
        group.toLowerCase() === exercise.grupoMuscularPrincipal.toLowerCase(),
    );
    setIsCustomGroupMode(!existsInGroups && Boolean(exercise.grupoMuscularPrincipal));
    setCustomGroupName(
      existsInGroups ? '' : exercise.grupoMuscularPrincipal,
    );
    setFormSelectedZones(
      exercise.zonasTrabajadas.length > 0
        ? [...exercise.zonasTrabajadas]
        : [exercise.grupoMuscularPrincipal],
    );
    setNewZoneInput('');
    setForm({
      nombre: exercise.nombre,
      grupo: exercise.grupoMuscularPrincipal,
      descripcion: exercise.descripcion,
      videoUrl: exercise.videoUrl || '',
    });
    setFormError('');
    setFormSuccess('');
    setIsFormModalOpen(true);
  }

  function addZone(zoneToAdd?: string) {
    const raw = (zoneToAdd ?? newZoneInput).trim();
    if (!raw) return;

    const zonesToAdd = raw
      .split(',')
      .map((zone) => zone.trim())
      .filter(Boolean);

    setFormSelectedZones((currentZones) => {
      const nextZones = [...currentZones];
      for (const zone of zonesToAdd) {
        if (!nextZones.some((current) => current.toLowerCase() === zone.toLowerCase())) {
          nextZones.push(zone);
        }
      }
      return nextZones;
    });

    if (zoneToAdd === undefined) setNewZoneInput('');
  }

  function removeZone(indexToRemove: number) {
    setFormSelectedZones((zones) =>
      zones.filter((_, index) => index !== indexToRemove),
    );
  }

  async function submitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError('');
    setFormSuccess('');

    const finalGroup = isCustomGroupMode
      ? customGroupName.trim()
      : form.grupo.trim();
    const validationError = validateExerciseForm({
      form,
      finalGroup,
      selectedZones: formSelectedZones,
    });
    if (validationError) {
      setFormError(validationError);
      return;
    }

    const payload: ExercisePayload = {
      nombre: form.nombre.trim(),
      grupoMuscularPrincipal: finalGroup,
      zonasTrabajadas: formSelectedZones,
      descripcion: form.descripcion.trim(),
      videoUrl: form.videoUrl.trim() || null,
    };

    setIsSubmitting(true);
    try {
      if (editTarget) {
        await exercisesService.updateExercise(editTarget.id, payload);
        setFormSuccess('¡Ejercicio actualizado y grupos musculares sincronizados!');
      } else {
        await exercisesService.createExercise(payload);
        setFormSuccess('¡Ejercicio creado y dado de alta en el catálogo con éxito!');
      }

      await Promise.all([loadExercises(), loadMetadata()]);
      setTimeout(() => {
        setIsFormModalOpen(false);
        setFormSuccess('');
      }, 1100);
    } catch (error: any) {
      setFormError(error.response?.data?.message || 'Error al guardar el ejercicio.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function deleteExercise() {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setDeleteError('');
    try {
      await exercisesService.deleteExercise(deleteTarget.id);
      await loadExercises();
      setDeleteTarget(null);
    } catch (error: any) {
      setDeleteError(error.response?.data?.message || 'Error al eliminar el ejercicio.');
    } finally {
      setIsDeleting(false);
    }
  }

  const filteredExercises = exercises.filter((exercise) => {
    const normalizedSearch = searchTerm.toLowerCase();
    const matchesSearch =
      exercise.nombre.toLowerCase().includes(normalizedSearch) ||
      exercise.descripcion.toLowerCase().includes(normalizedSearch) ||
      exercise.zonasTrabajadas.some((zone) =>
        zone.toLowerCase().includes(normalizedSearch),
      );
    const matchesMuscle =
      selectedMuscle === 'TODOS' ||
      exercise.grupoMuscularPrincipal.toUpperCase() === selectedMuscle;
    return matchesSearch && matchesMuscle;
  });

  const categories = ['TODOS', ...muscleGroups.map((group) => group.toUpperCase())];
  const unselectedSuggestions = targetZonesList.filter(
    (zone) =>
      !formSelectedZones.some(
        (selected) => selected.toLowerCase() === zone.toLowerCase(),
      ),
  );

  return {
    categories,
    deleteError,
    deleteExercise,
    deleteTarget,
    editTarget,
    filteredExercises,
    form,
    formError,
    formSelectedZones,
    formSuccess,
    isCustomGroupMode,
    isDeleting,
    isDetailModalOpen,
    isFormModalOpen,
    isLoading,
    isSubmitting,
    muscleGroups,
    newZoneInput,
    openCreateModal,
    openEditModal,
    removeZone,
    searchTerm,
    selectedExerciseForModal,
    selectedMuscle,
    setCustomGroupName,
    setDeleteTarget,
    setForm,
    setIsCustomGroupMode,
    setIsDetailModalOpen,
    setIsFormModalOpen,
    setNewZoneInput,
    setSearchTerm,
    setSelectedExerciseForModal,
    setSelectedMuscle,
    submitForm,
    unselectedSuggestions,
    addZone,
    customGroupName,
  };
}
