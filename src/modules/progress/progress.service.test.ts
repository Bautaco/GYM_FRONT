import { beforeEach, describe, expect, it, vi } from 'vitest';
import { api } from '../../shared/api/api';
import { progressService } from './progress.service';

/* Las consultas de métricas se prueban donde se definen sus endpoints. */
vi.mock('../../shared/api/api', () => ({ api: { get: vi.fn(), post: vi.fn() } }));

describe('progressService', () => {
  beforeEach(() => vi.clearAllMocks());

  it('consulta el resumen administrativo con sus filtros', async () => {
    const data = { adherenceAndCoverage: {}, loadAndSportsPerformance: {}, staffAndCatalogOperation: {} };
    (api.get as any).mockResolvedValueOnce({ data });
    const filters = { period: '90d' as const, trainerId: 'trainer-abc', adherenceRange: 'green' as const };

    expect(await progressService.getAdminOverview(filters)).toEqual(data);
    expect(api.get).toHaveBeenCalledWith('/api/v1/analytics/admin/overview', { params: filters });
  });

  it('consulta el resumen sin filtros cuando no se reciben', async () => {
    (api.get as any).mockResolvedValueOnce({ data: { test: true } });

    await progressService.getAdminOverview();

    expect(api.get).toHaveBeenCalledWith('/api/v1/analytics/admin/overview', { params: undefined });
  });

  it('consulta fuerza con atleta y ejercicio', async () => {
    (api.get as any).mockResolvedValueOnce({ data: { history: [] } });

    await progressService.getStrengthProgress('ath-1', 'ex-bench');

    expect(api.get).toHaveBeenCalledWith('/api/v1/analytics/athletes/ath-1/strength-progress', { params: { exerciseId: 'ex-bench' } });
  });

  it('consulta la adherencia de un atleta', async () => {
    (api.get as any).mockResolvedValueOnce({ data: { adherencePercentage: 85 } });

    const result = await progressService.getAdherence('ath-1');

    expect(api.get).toHaveBeenCalledWith('/api/v1/analytics/athletes/ath-1/adherence');
    expect(result.adherencePercentage).toBe(85);
  });

  it('envía las observaciones junto con el peso corporal', async () => {
    (api.post as any).mockResolvedValueOnce({
      data: { id: 'weight-1', athleteId: 'ath-1', weightKg: 75, notes: 'En ayunas' },
    });

    const result = await progressService.logBodyWeight('ath-1', 75, 'En ayunas');

    expect(api.post).toHaveBeenCalledWith('/api/v1/athletes/ath-1/body-weight', {
      weightKg: 75,
      notes: 'En ayunas',
    });
    expect(result.notes).toBe('En ayunas');
  });
});
