import { api } from '../../shared/api/api.js';
import type { User } from '../../types/index.js';
import type { CreateManagedUserInput } from './admin.types.js';

/** Peticiones exclusivas del panel de administración de usuarios. */
export const adminService = {
  async getAllUsers(): Promise<User[]> {
    const response = await api.get<User[]>('/api/v1/users/admin/all');
    return response.data;
  },

  async createUser(data: CreateManagedUserInput): Promise<User> {
    const response = await api.post<User>('/api/v1/users/admin/create', data);
    return response.data;
  },

  /** Asigna o cambia el entrenador responsable obligatorio de un atleta. */
  async assignTrainer(athleteId: string, trainerId: string): Promise<User> {
    const response = await api.patch<User>(
      `/api/v1/users/admin/${athleteId}/trainer`,
      { trainerId },
    );
    return response.data;
  },

  async deleteUser(id: string): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(
      `/api/v1/users/admin/${id}`,
    );
    return response.data;
  },
};
