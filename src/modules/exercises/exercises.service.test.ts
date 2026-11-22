import { beforeEach, describe, expect, it, vi } from 'vitest';
import { api } from '../../shared/api/api';
import { exercisesService } from './exercises.service';

/* Estas pruebas viven junto al servicio que realmente usa el catálogo. */
vi.mock('../../shared/api/api', () => ({
  api: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));

describe('exercisesService', () => {
  beforeEach(() => vi.clearAllMocks());

  it('envía videoUrl = null al limpiar el enlace de un ejercicio', async () => {
    (api.patch as any).mockResolvedValueOnce({ data: { id: 'ex-1', nombre: 'Sentadilla', videoUrl: null } });
    const payload = { nombre: 'Sentadilla Profunda', videoUrl: null };

    const result = await exercisesService.updateExercise('ex-1', payload as any);

    expect(api.patch).toHaveBeenCalledWith('/api/v1/exercises/ex-1', payload);
    expect(result.videoUrl).toBeNull();
  });

  it('crea un ejercicio y devuelve la respuesta de la API', async () => {
    (api.post as any).mockResolvedValueOnce({ data: { id: 'ex-new', nombre: 'Hip Thrust' } });
    const payload = { nombre: 'Hip Thrust', grupoMuscularPrincipal: 'Glúteos', zonasTrabajadas: ['Glúteo Mayor'], descripcion: 'Empuje de cadera', videoUrl: 'https://youtube.com/watch?v=test' };

    const result = await exercisesService.createExercise(payload as any);

    expect(api.post).toHaveBeenCalledWith('/api/v1/exercises', payload);
    expect(result.id).toBe('ex-new');
  });

  it('elimina un ejercicio mediante su endpoint', async () => {
    (api.delete as any).mockResolvedValueOnce({ data: {} });

    await exercisesService.deleteExercise('ex-1');

    expect(api.delete).toHaveBeenCalledWith('/api/v1/exercises/ex-1');
  });
});
