import { api } from './api.js';
import {
  Exercise,
  TrainingPlan,
  WorkoutSession,
  BodyWeightRecord,
  LogWorkoutSessionResult,
  RoutineTemplate,
} from '../types/index.js';

export const trainingService = {
  // Ejercicios
  async getExercises(): Promise<Exercise[]> {
    const response = await api.get<Exercise[]>('/api/v1/exercises');
    return response.data;
  },

  async getMuscleGroups(): Promise<string[]> {
    const response = await api.get<string[]>('/api/v1/exercises/muscle-groups');
    return response.data;
  },

  async getTargetZones(): Promise<string[]> {
    const response = await api.get<string[]>('/api/v1/exercises/target-zones');
    return response.data;
  },

  async createMuscleGroup(name: string): Promise<{ name: string }> {
    const response = await api.post<{ name: string }>('/api/v1/exercises/muscle-groups', { name });
    return response.data;
  },

  async createTargetZone(name: string, muscleGroupName?: string): Promise<{ name: string }> {
    const response = await api.post<{ name: string }>('/api/v1/exercises/target-zones', {
      name,
      muscleGroupName,
    });
    return response.data;
  },

  async createExercise(exercise: Partial<Exercise>): Promise<Exercise> {
    const response = await api.post<Exercise>('/api/v1/exercises', exercise);
    return response.data;
  },

  async updateExercise(id: string, exercise: Partial<Exercise>): Promise<Exercise> {
    const response = await api.patch<Exercise>(`/api/v1/exercises/${id}`, exercise);
    return response.data;
  },

  async deleteExercise(id: string): Promise<void> {
    await api.delete(`/api/v1/exercises/${id}`);
  },

  // Planes de Entrenamiento
  async getActivePlan(athleteId: string): Promise<TrainingPlan | null> {
    const response = await api.get<TrainingPlan | null>(
      `/api/v1/training-plans/athlete/${athleteId}`,
    );
    return response.data;
  },

  async createPlan(plan: any): Promise<TrainingPlan> {
    const response = await api.post<TrainingPlan>('/api/v1/training-plans', plan);
    return response.data;
  },

  // Registro de Sesión (Marcas reales + PR Detection HU-09)
  async logWorkoutSession(session: any): Promise<LogWorkoutSessionResult> {
    const response = await api.post<LogWorkoutSessionResult>(
      '/api/v1/training-sessions/log',
      session,
    );
    return response.data;
  },

  async getAthleteSessions(athleteId: string): Promise<WorkoutSession[]> {
    const response = await api.get<WorkoutSession[]>(
      `/api/v1/training-sessions/athlete/${athleteId}`,
    );
    return response.data;
  },

  // Peso Corporal
  async logBodyWeight(
    athleteId: string,
    weightKg: number,
    date?: string,
  ): Promise<BodyWeightRecord> {
    const response = await api.post<BodyWeightRecord>(
      `/api/v1/athletes/${athleteId}/body-weight`,
      {
        weightKg,
        date: date || new Date().toISOString().split('T')[0],
      },
    );
    return response.data;
  },

  async getBodyWeightHistory(athleteId: string): Promise<BodyWeightRecord[]> {
    const response = await api.get<BodyWeightRecord[]>(
      `/api/v1/athletes/${athleteId}/body-weight`,
    );
    return response.data;
  },

  async getWeightHistory(athleteId: string): Promise<BodyWeightRecord[]> {
    return this.getBodyWeightHistory(athleteId);
  },

  // HU-12: Plantillas de Rutinas (Templates)
  async getTemplates(): Promise<RoutineTemplate[]> {
    const response = await api.get<RoutineTemplate[]>('/api/v1/templates');
    return response.data;
  },

  async createTemplate(template: any): Promise<RoutineTemplate> {
    const response = await api.post<RoutineTemplate>('/api/v1/templates', template);
    return response.data;
  },

  async deleteTemplate(id: string): Promise<void> {
    await api.delete(`/api/v1/templates/${id}`);
  },
};
