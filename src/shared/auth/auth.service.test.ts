import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authService } from './auth.service.js';
import { api } from '../api/api.js';

describe('authService (Frontend Unit)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('login: realiza petición POST /api/v1/auth/login y retorna respuesta con token', async () => {
    const mockResponse = {
      accessToken: 'token-abc',
      user: { id: '1', email: 'user@gym.com', fullName: 'User One', role: 'ATLETA' },
    };
    vi.spyOn(api, 'post').mockResolvedValueOnce({ data: mockResponse });

    const result = await authService.login('user@gym.com', 'password');
    expect(api.post).toHaveBeenCalledWith('/api/v1/auth/login', {
      email: 'user@gym.com',
      password: 'password',
    });
    expect(result.accessToken).toBe('token-abc');
  });

  it('register: envía datos de registro y retorna nuevo usuario con token', async () => {
    const mockUser = {
      accessToken: 'token-new',
      user: { id: '2', email: 'new@gym.com', fullName: 'New User', role: 'ENTRENADOR' },
    };
    vi.spyOn(api, 'post').mockResolvedValueOnce({ data: mockUser });

    const result = await authService.register({
      email: 'new@gym.com',
      password: 'secretpassword',
      fullName: 'New User',
      role: 'ENTRENADOR',
    });

    expect(api.post).toHaveBeenCalledWith('/api/v1/auth/register', expect.objectContaining({
      email: 'new@gym.com',
    }));
    expect(result.user.fullName).toBe('New User');
  });

  it('getMe: consulta datos del perfil autenticado', async () => {
    const mockProfile = { id: '1', email: 'me@gym.com', fullName: 'Me', role: 'ADMIN' };
    vi.spyOn(api, 'get').mockResolvedValueOnce({ data: mockProfile });

    const result = await authService.getMe();
    expect(api.get).toHaveBeenCalledWith('/api/v1/auth/me');
    expect(result.role).toBe('ADMIN');
  });

  it('getAthletes: retorna la lista de atletas registrados', async () => {
    const mockAthletes = [
      { id: 'ath-1', fullName: 'Atleta Uno', role: 'ATLETA' },
      { id: 'ath-2', fullName: 'Atleta Dos', role: 'ATLETA' },
    ];
    vi.spyOn(api, 'get').mockResolvedValueOnce({ data: mockAthletes });

    const result = await authService.getAthletes();
    expect(api.get).toHaveBeenCalledWith('/api/v1/users/athletes');
    expect(result).toHaveLength(2);
  });

  it('getTrainers: retorna la lista de entrenadores', async () => {
    const mockTrainers = [{ id: 'tr-1', fullName: 'Profesor X', role: 'ENTRENADOR' }];
    vi.spyOn(api, 'get').mockResolvedValueOnce({ data: mockTrainers });

    const result = await authService.getTrainers();
    expect(api.get).toHaveBeenCalledWith('/api/v1/users/trainers');
    expect(result).toHaveLength(1);
  });

  it('updateProfile: actualiza datos personales del perfil', async () => {
    const updated = { id: '1', fullName: 'Updated Name', phone: '+54911' };
    vi.spyOn(api, 'patch').mockResolvedValueOnce({ data: updated });

    const result = await authService.updateProfile({ phone: '+54911' });
    expect(api.patch).toHaveBeenCalledWith('/api/v1/users/me', { phone: '+54911' });
    expect(result.phone).toBe('+54911');
  });
});
