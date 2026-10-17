export enum UserRole {
  ADMIN = 'ADMIN',
  ENTRENADOR = 'ENTRENADOR',
  ATLETA = 'ATLETA',
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  phone?: string;
  notes?: string;
  avatarUrl?: string;
  trainerId?: string;
  trainerName?: string;
  createdAt?: string;
}

export interface LoginResponse {
  accessToken: string;
  user: User;
}

export interface Exercise {
  id: string;
  nombre: string;
  grupoMuscularPrincipal: string;
  zonasTrabajadas: string[];
  descripcion: string;
  videoUrl?: string;
}

export interface ExerciseItem {
  id?: string;
  exerciseId: string;
  exerciseName: string;
  targetSets: number;
  targetReps: number;
  targetWeightKg: number;
  restSeconds?: number;
  notes?: string;
  cadence?: string; // HU-12: Cadencia / Tempo (ej. "3-0-1-0")
}

export interface Routine {
  id?: string;
  name: string;
  dayOfWeek: number;
  description?: string;
  exerciseItems: ExerciseItem[];
}

export interface RoutineTemplate {
  id: string;
  trainerId: string;
  name: string;
  description?: string;
  category?: string;
  exerciseItems: ExerciseItem[];
  createdAt?: string;
}

export interface TrainingPlan {
  id: string;
  name: string;
  athleteId: string;
  trainerId: string;
  athleteName?: string;
  trainerName?: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  routines: Routine[];
}

export interface LoggedSet {
  id?: string;
  exerciseId: string;
  exerciseName: string;
  setNumber: number;
  actualReps: number;
  actualWeightKg: number;
  isCompleted: boolean;
}

export interface WorkoutSession {
  id: string;
  athleteId: string;
  trainingPlanId: string;
  routineId: string;
  routineName: string;
  date: string;
  completed: boolean;
  notes?: string;
  rpe?: number;
  sets: LoggedSet[];
  createdAt: string;
}

export interface DetectedPR {
  exerciseId: string;
  exerciseName: string;
  type: 'PESO_MAXIMO' | '1RM_ESTIMADO';
  previousRecord: number;
  newRecord: number;
  improvement: number;
}

export interface LogWorkoutSessionResult {
  session: WorkoutSession;
  personalRecords: DetectedPR[];
}

export interface BodyWeightRecord {
  id: string;
  athleteId: string;
  weightKg: number;
  date: string;
  recordedAt?: string;
  notes?: string;
}

export interface AdherenceReport {
  athleteId: string;
  hasActivePlan: boolean;
  plannedSessions: number;
  planName?: string;
  message: string;
  completedSessions: number;
  adherencePercentage: number;
}

export type AdherenceMetrics = AdherenceReport;

export interface StrengthProgressPoint {
  date: string;
  maxWeightKg: number;
}

export interface StrengthProgress {
  exerciseId: string;
  exerciseName: string;
  history: StrengthProgressPoint[];
}

export type ExerciseMaxWeightHistory = StrengthProgress;
