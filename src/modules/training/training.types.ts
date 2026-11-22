/**
 * Tipos que usa el módulo de entrenamiento.
 *
 * Los tipos del dominio ya están declarados en src/types/index.ts porque otras
 * pantallas todavía los usan. Se reexportan aquí para que las páginas nuevas
 * dependan de su propio módulo durante la migración.
 */
export type {
  DetectedPR,
  LogWorkoutSessionResult,
  Routine,
  RoutineTemplate,
  TrainingPlan,
  WorkoutSession,
} from '../../types/index.js';

/** Estado temporal de una serie mientras el atleta registra una sesión. */
export interface EditableSetState {
  exerciseId: string;
  exerciseName: string;
  setNumber: number;
  targetWeightKg: number;
  targetReps: number;
  actualWeightKg: string;
  actualReps: string;
  isCompleted: boolean;
}

/** Estado temporal de una rutina mientras el entrenador construye un plan. */
export interface RoutineFormState {
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
    cadence?: string;
  }[];
}
