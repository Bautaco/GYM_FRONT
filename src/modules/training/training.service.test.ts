import { describe, it, expect, vi, beforeEach } from 'vitest';
import { trainingService } from './training.service.js';
import { api } from '../../shared/api/api.js';

describe('trainingService (Frontend Unit)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getActivePlan: obtiene el plan activo de un atleta', async () => {
    const mockPlan = { id: 'plan-1', athleteId: 'ath-1', startDate: '2026-01-01', routines: [] };
    vi.spyOn(api, 'get').mockResolvedValueOnce({ data: mockPlan });

    const result = await trainingService.getActivePlan('ath-1');
    expect(api.get).toHaveBeenCalledWith('/api/v1/training-plans/athlete/ath-1');
    expect(result?.id).toBe('plan-1');
  });

  it('getAllPlansByAthlete: consulta el historial completo de planes', async () => {
    const mockPlans = [{ id: 'p1' }, { id: 'p2' }];
    vi.spyOn(api, 'get').mockResolvedValueOnce({ data: mockPlans });

    const result = await trainingService.getAllPlansByAthlete('ath-1');
    expect(api.get).toHaveBeenCalledWith('/api/v1/training-plans/athlete/ath-1/all');
    expect(result).toHaveLength(2);
  });

  it('createPlan: envía datos del microciclo para crear un nuevo plan', async () => {
    const payload = { athleteId: 'ath-1', startDate: '2026-06-01', routines: [] };
    vi.spyOn(api, 'post').mockResolvedValueOnce({ data: { id: 'plan-new', ...payload } });

    const result = await trainingService.createPlan(payload);
    expect(api.post).toHaveBeenCalledWith('/api/v1/training-plans', payload);
    expect(result.id).toBe('plan-new');
  });

  it('logWorkoutSession: envía series completadas y RPE al backend', async () => {
    const sessionData = { athleteId: 'ath-1', rpe: 8, sets: [] };
    vi.spyOn(api, 'post').mockResolvedValueOnce({
      data: { session: { id: 'sess-1' }, personalRecords: [] },
    });

    const result = await trainingService.logWorkoutSession(sessionData);
    expect(api.post).toHaveBeenCalledWith('/api/v1/training-sessions/log', sessionData);
    expect(result.session.id).toBe('sess-1');
  });

  it('getAthleteSessions: obtiene las sesiones registradas históricas', async () => {
    vi.spyOn(api, 'get').mockResolvedValueOnce({ data: [{ id: 's1' }, { id: 's2' }] });

    const result = await trainingService.getAthleteSessions('ath-1');
    expect(api.get).toHaveBeenCalledWith('/api/v1/training-sessions/athlete/ath-1');
    expect(result).toHaveLength(2);
  });

  it('createTemplate: guarda una plantilla de rutina reutilizable', async () => {
    const templateData = { name: 'Empuje A', category: 'Hipertrofia', exerciseItems: [] };
    vi.spyOn(api, 'post').mockResolvedValueOnce({ data: { id: 'tpl-1', ...templateData } });

    const result = await trainingService.createTemplate(templateData);
    expect(api.post).toHaveBeenCalledWith('/api/v1/templates', templateData);
    expect(result.id).toBe('tpl-1');
  });
});
