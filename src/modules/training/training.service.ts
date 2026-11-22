import { api } from '../../shared/api/api.js';
import type {
  LogWorkoutSessionResult,
  RoutineTemplate,
  TrainingPlan,
  WorkoutSession,
} from './training.types.js';

/**
 * Único lugar del módulo que conoce las rutas HTTP de planes, sesiones y
 * plantillas. Las páginas usan este servicio y no hacen peticiones directas.
 */
export const trainingService = {
  async getActivePlan(athleteId: string): Promise<TrainingPlan | null> {
    const response = await api.get<TrainingPlan | null>(
      `/api/v1/training-plans/athlete/${athleteId}`,
    );
    return response.data;
  },

  async getAllPlansByAthlete(athleteId: string): Promise<TrainingPlan[]> {
    const response = await api.get<TrainingPlan[]>(
      `/api/v1/training-plans/athlete/${athleteId}/all`,
    );
    return response.data;
  },

  async createPlan(plan: any): Promise<TrainingPlan> {
    const response = await api.post<TrainingPlan>('/api/v1/training-plans', plan);
    return response.data;
  },

  async updatePlan(id: string, plan: any): Promise<TrainingPlan> {
    const response = await api.put<TrainingPlan>(
      `/api/v1/training-plans/${id}`,
      plan,
    );
    return response.data;
  },

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
