import { describe, it, expect, vi, beforeEach } from 'vitest';
import { analyticsService } from './analyticsService';
import { api } from './api';

vi.mock('./api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe('analyticsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getAdminOverview llama al endpoint con los query params correctos', async () => {
    const mockData = { adherenceAndCoverage: {}, loadAndSportsPerformance: {}, staffAndCatalogOperation: {} };
    (api.get as any).mockResolvedValueOnce({ data: mockData });

    const filters = {
      period: '90d' as const,
      trainerId: 'trainer-abc',
      adherenceRange: 'green' as const,
    };

    const result = await analyticsService.getAdminOverview(filters);

    expect(api.get).toHaveBeenCalledWith('/api/v1/analytics/admin/overview', {
      params: filters,
    });
    expect(result).toEqual(mockData);
  });

  it('getAdminOverview sin filtros llama al endpoint base', async () => {
    (api.get as any).mockResolvedValueOnce({ data: { test: true } });

    await analyticsService.getAdminOverview();

    expect(api.get).toHaveBeenCalledWith('/api/v1/analytics/admin/overview', {
      params: undefined,
    });
  });

  it('getStrengthProgress llama al endpoint con athleteId y params con exerciseId', async () => {
    (api.get as any).mockResolvedValueOnce({ data: { history: [] } });

    await analyticsService.getStrengthProgress('ath-1', 'ex-bench');

    expect(api.get).toHaveBeenCalledWith('/api/v1/analytics/athletes/ath-1/strength-progress', {
      params: { exerciseId: 'ex-bench' },
    });
  });

  it('getAdherence llama al endpoint del atleta', async () => {
    (api.get as any).mockResolvedValueOnce({ data: { adherencePercentage: 85 } });

    const res = await analyticsService.getAdherence('ath-1');
    expect(api.get).toHaveBeenCalledWith('/api/v1/analytics/athletes/ath-1/adherence');
    expect(res.adherencePercentage).toBe(85);
  });
});

