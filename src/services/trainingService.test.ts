import { describe, it, expect, vi, beforeEach } from 'vitest';
import { trainingService } from './trainingService';
import { api } from './api';

vi.mock('./api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('trainingService - Manejo de Ejercicios y Videos', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('updateExercise envía correctamente videoUrl = null al limpiar el link', async () => {
    (api.patch as any).mockResolvedValueOnce({
      data: {
        id: 'ex-1',
        nombre: 'Sentadilla',
        videoUrl: null,
      },
    });

    const payload = {
      nombre: 'Sentadilla Profunda',
      videoUrl: null,
    };

    const res = await trainingService.updateExercise('ex-1', payload);

    expect(api.patch).toHaveBeenCalledWith('/api/v1/exercises/ex-1', payload);
    expect(res.videoUrl).toBeNull();
  });

  it('createExercise envía los datos y retorna el ejercicio creado', async () => {
    (api.post as any).mockResolvedValueOnce({
      data: { id: 'ex-new', nombre: 'Hip Thrust' },
    });

    const payload = {
      nombre: 'Hip Thrust',
      grupoMuscularPrincipal: 'Glúteos',
      zonasTrabajadas: ['Glúteo Mayor'],
      descripcion: 'Empuje de cadera',
      videoUrl: 'https://youtube.com/watch?v=test',
    };

    const res = await trainingService.createExercise(payload as any);
    expect(api.post).toHaveBeenCalledWith('/api/v1/exercises', payload);
    expect(res.id).toBe('ex-new');
  });

  it('deleteExercise llama al endpoint DELETE correspondiente', async () => {
    (api.delete as any).mockResolvedValueOnce({ data: {} });

    await trainingService.deleteExercise('ex-1');
    expect(api.delete).toHaveBeenCalledWith('/api/v1/exercises/ex-1');
  });
});
