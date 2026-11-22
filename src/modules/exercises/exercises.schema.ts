import type { ExerciseFormValues } from './exercises.types.js';

/** Mensajes de validación que se muestran en el formulario. */
export interface ExerciseFormValidationInput {
  form: ExerciseFormValues;
  finalGroup: string;
  selectedZones: string[];
}

/**
 * Reúne reglas de validación propias del formulario de ejercicios.
 * Es una función pura: no modifica estado, no muestra la interfaz y no usa la API.
 */
export function validateExerciseForm({
  form,
  finalGroup,
  selectedZones,
}: ExerciseFormValidationInput): string | null {
  if (!form.nombre.trim() || !form.descripcion.trim()) {
    return 'El nombre y la descripción técnica son obligatorios.';
  }

  if (!finalGroup) {
    return 'Debes seleccionar o ingresar un Grupo Muscular Principal.';
  }

  if (selectedZones.length === 0) {
    return 'Debes especificar al menos una Zona Trabajada.';
  }

  return null;
}
