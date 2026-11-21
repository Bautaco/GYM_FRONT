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
  videoUrl?: string | null;
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
  frequencyPerWeek?: number;
  sessionsPerDay?: number;
  createdAt?: string;
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
  totalPrescribedRoutines?: number;
  completedSessions: number;
  adherencePercentage: number;
  plannedSessions?: number;
  message?: string;
  planName?: string;
  hasActivePlan?: boolean;
  athleteId?: string;
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

export interface AdminOverviewFilters {
  period?: 'all' | '30d' | '90d' | '365d';
  startDate?: string;
  endDate?: string;
  trainerId?: string;
  adherenceRange?: 'all' | 'green' | 'yellow' | 'red';
}

export interface AdminExecutiveOverview {
  filters: {
    period: 'all' | '30d' | '90d' | '365d';
    trainerId: string;
    adherenceRange: 'all' | 'green' | 'yellow' | 'red';
  };
  adherenceAndCoverage: {
    overallAdherencePct: number;
    adherenceRanges: {
      green: { count: number; percentage: number };
      yellow: { count: number; percentage: number };
      red: { count: number; percentage: number };
    };
    planCoverage: {
      totalAthletes: number;
      athletesWithActivePlan: number;
      athletesWithExpiredPlan: number;
      athletesWithoutPlan: number;
      activePlanCoveragePercentage: number;
    };
    athletesList: {
      athleteId: string;
      athleteName: string;
      trainerId: string;
      trainerName: string;
      hasActivePlan: boolean;
      planStatus: 'Activo' | 'Vencido' | 'Sin Plan';
      planName: string;
      adherencePercentage: number;
      completedSessions: number;
      plannedSessions: number;
      range: 'green' | 'yellow' | 'red';
      lastSessionDate: string | null;
      tonnageKg: number;
    }[];
  };
  loadAndSportsPerformance: {
    fatigueAndLoad: {
      averageRpe: number;
      rpeDistribution: {
        level: string;
        range: string;
        count: number;
        percentage: number;
        color: string;
      }[];
      totalDurationMinutes: number;
      averageDurationMinutes: number;
      totalTonnageKg: number;
      averageSessionTonnageKg: number;
      totalCompletedSessions: number;
    };
    strengthAndRecords: {
      totalPRs: number;
      averageEstimated1RM: number;
      strengthEvolution: {
        monthYear: string;
        sessionsCount: number;
        tonnageKg: number;
        prsDetected: number;
        averageRpe: number;
      }[];
    };
    anthropometry: {
      totalWeightRecords: number;
      weighedAthletesCount: number;
      weighInFrequencyPerAthlete: number;
    };
    biomechanicalDistribution: {
      muscleGroup: string;
      totalSets: number;
      percentage: number;
    }[];
  };
  staffAndCatalogOperation: {
    usersByRole: {
      adminCount: number;
      trainerCount: number;
      athleteCount: number;
      totalUsers: number;
    };
    coachesPerformance: {
      trainerId: string;
      trainerName: string;
      email: string;
      phone: string;
      assignedAthletesCount: number;
      prescribedPlansCount: number;
      activePlansCount: number;
      templatesCreatedCount: number;
      avgAdherencePct: number;
      completedSessionsCount: number;
    }[];
    catalogMetrics: {
      totalExercises: number;
      exercisesWithVideo: number;
      exercisesWithoutVideo: number;
      videoCoveragePercentage: number;
      videoTypes: {
        youtubeStandard: number;
        youtubeShorts: number;
        directMp4: number;
      };
    };
  };
}
