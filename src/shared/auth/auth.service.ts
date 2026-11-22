import { api } from '../api/api.js';
import type { LoginResponse, User } from '../../types/index.js';

/** Operaciones relacionadas con la sesión y con el usuario autenticado. */
export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/api/v1/auth/login', {
      email,
      password,
    });
    return response.data;
  },

  async register(data: {
    email: string;
    password: string;
    fullName: string;
    role: string;
    phone?: string;
  }): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/api/v1/auth/register', data);
    return response.data;
  },

  async getMe(): Promise<User> {
    const response = await api.get<User>('/api/v1/auth/me');
    return response.data;
  },

  async getAthletes(): Promise<User[]> {
    const response = await api.get<User[]>('/api/v1/users/athletes');
    return response.data;
  },

  async getTrainers(): Promise<User[]> {
    const response = await api.get<User[]>('/api/v1/users/trainers');
    return response.data;
  },

  async updateProfile(data: {
    fullName?: string;
    phone?: string;
    notes?: string;
    avatarUrl?: string;
    currentPassword?: string;
    newPassword?: string;
  }): Promise<User> {
    const response = await api.patch<User>('/api/v1/users/me', data);
    return response.data;
  },
};
