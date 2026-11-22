import { api } from '../../shared/api/api.js';
import type {
  AdherenceReport,
  AdminExecutiveOverview,
  AdminOverviewFilters,
  BodyWeightRecord,
  StrengthProgress,
} from './progress.types.js';

/**
 * Centraliza las peticiones de analítica y antropometría.
 * La página de progreso no conoce endpoints ni usa axios directamente.
 */
export const progressService = {
  async getAdminOverview(
    filters?: AdminOverviewFilters,
  ): Promise<AdminExecutiveOverview> {
    const response = await api.get<AdminExecutiveOverview>(
      '/api/v1/analytics/admin/overview',
      { params: filters },
    );
    return response.data;
  },

  async getStrengthProgress(
    athleteId: string,
    exerciseId: string,
  ): Promise<StrengthProgress> {
    const response = await api.get<StrengthProgress>(
      `/api/v1/analytics/athletes/${athleteId}/strength-progress`,
      { params: { exerciseId } },
    );
    return response.data;
  },

  async getAdherence(athleteId: string): Promise<AdherenceReport> {
    const response = await api.get<AdherenceReport>(
      `/api/v1/analytics/athletes/${athleteId}/adherence`,
    );
    return response.data;
  },

  async logBodyWeight(
    athleteId: string,
    weightKg: number,
    notes?: string,
  ): Promise<BodyWeightRecord> {
    const response = await api.post<BodyWeightRecord>(
      `/api/v1/athletes/${athleteId}/body-weight`,
      {
        weightKg,
        // El backend recibe `notes`; no existe un campo `date` en su DTO.
        notes: notes?.trim() || undefined,
      },
    );
    return response.data;
  },

  async getWeightHistory(athleteId: string): Promise<BodyWeightRecord[]> {
    const response = await api.get<BodyWeightRecord[]>(
      `/api/v1/athletes/${athleteId}/body-weight`,
    );
    return response.data;
  },
};
