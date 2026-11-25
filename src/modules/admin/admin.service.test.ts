import { describe, it, expect, vi, beforeEach } from 'vitest';
import { adminService } from './admin.service.js';
import { api } from '../../shared/api/api.js';

describe('adminService (Frontend Unit)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getAllUsers: solicita el listado completo de usuarios registrados', async () => {
    const mockUsers = [
      { id: '1', fullName: 'Admin', role: 'ADMIN' },
      { id: '2', fullName: 'Coach', role: 'ENTRENADOR' },
    ];
    vi.spyOn(api, 'get').mockResolvedValueOnce({ data: mockUsers });

    const result = await adminService.getAllUsers();
    expect(api.get).toHaveBeenCalledWith('/api/v1/users/admin/all');
    expect(result).toHaveLength(2);
  });

  it('createUser: envía los datos para crear un usuario desde administración', async () => {
    const input = {
      email: 'newuser@gym.com',
      password: 'pass',
      fullName: 'New Person',
      role: 'ATLETA' as const,
    };
    vi.spyOn(api, 'post').mockResolvedValueOnce({ data: { id: 'usr-new', ...input } });

    const result = await adminService.createUser(input);
    expect(api.post).toHaveBeenCalledWith('/api/v1/users/admin/create', input);
    expect(result.id).toBe('usr-new');
  });

  it('assignTrainer: vincula un entrenador responsable a un atleta', async () => {
    const updated = { id: 'ath-1', trainerId: 'tr-1' };
    vi.spyOn(api, 'patch').mockResolvedValueOnce({ data: updated });

    const result = await adminService.assignTrainer('ath-1', 'tr-1');
    expect(api.patch).toHaveBeenCalledWith('/api/v1/users/admin/ath-1/trainer', {
      trainerId: 'tr-1',
    });
    expect(result.trainerId).toBe('tr-1');
  });

  it('assignTrainer: permite desasignar un entrenador enviando null', async () => {
    const updated = { id: 'ath-1', trainerId: null };
    vi.spyOn(api, 'patch').mockResolvedValueOnce({ data: updated });

    const result = await adminService.assignTrainer('ath-1', null);
    expect(api.patch).toHaveBeenCalledWith('/api/v1/users/admin/ath-1/trainer', {
      trainerId: null,
    });
    expect(result.trainerId).toBeNull();
  });

  it('deleteUser: ejecuta la baja definitiva de una cuenta', async () => {
    vi.spyOn(api, 'delete').mockResolvedValueOnce({ data: { message: 'Eliminado' } });

    const result = await adminService.deleteUser('usr-to-delete');
    expect(api.delete).toHaveBeenCalledWith('/api/v1/users/admin/usr-to-delete');
    expect(result.message).toBe('Eliminado');
  });
});
