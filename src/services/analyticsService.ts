import { api } from './api.js';
import {
  StrengthProgress,
  AdherenceReport,
  AdminExecutiveOverview,
  AdminOverviewFilters,
} from '../types/index.js';

export const analyticsService = {
  async getAdminOverview(
    filters?: AdminOverviewFilters,
  ): Promise<AdminExecutiveOverview> {
    const response = await api.get<AdminExecutiveOverview>(
      `/api/v1/analytics/admin/overview`,
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
      {
        params: { exerciseId },
      },
    );
    return response.data;
  },

  async getAdherence(athleteId: string): Promise<AdherenceReport> {
    const response = await api.get<AdherenceReport>(
      `/api/v1/analytics/athletes/${athleteId}/adherence`,
    );
    return response.data;
  },
};
