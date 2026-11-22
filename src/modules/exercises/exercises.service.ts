import { api } from '../../shared/api/api.js';
import type { Exercise, ExercisePayload } from './exercises.types.js';

/**
 * Único lugar del módulo que conoce las rutas HTTP de ejercicios.
 * Los componentes y hooks usan este servicio; no llaman axios directamente.
 */
export const exercisesService = {
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
    const response = await api.post<{ name: string }>(
      '/api/v1/exercises/muscle-groups',
      { name },
    );
    return response.data;
  },

  async createTargetZone(
    name: string,
    muscleGroupName?: string,
  ): Promise<{ name: string }> {
    const response = await api.post<{ name: string }>(
      '/api/v1/exercises/target-zones',
      { name, muscleGroupName },
    );
    return response.data;
  },

  async createExercise(exercise: ExercisePayload): Promise<Exercise> {
    const response = await api.post<Exercise>('/api/v1/exercises', exercise);
    return response.data;
  },

  async updateExercise(
    id: string,
    exercise: ExercisePayload,
  ): Promise<Exercise> {
    const response = await api.patch<Exercise>(
      `/api/v1/exercises/${id}`,
      exercise,
    );
    return response.data;
  },

  async deleteExercise(id: string): Promise<void> {
    await api.delete(`/api/v1/exercises/${id}`);
  },
};
