/**
 * Datos de un ejercicio tal como los devuelve la API.
 * Este tipo pertenece al módulo porque describe su concepto principal.
 */
export interface Exercise {
  id: string;
  nombre: string;
  grupoMuscularPrincipal: string;
  zonasTrabajadas: string[];
  descripcion: string;
  videoUrl?: string | null;
}

/** Datos editables en el formulario, antes de prepararlos para la API. */
export interface ExerciseFormValues {
  nombre: string;
  grupo: string;
  descripcion: string;
  videoUrl: string;
}

/** Datos que se envían para crear o actualizar un ejercicio. */
export type ExercisePayload = Partial<Exercise>;
