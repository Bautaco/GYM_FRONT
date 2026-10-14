import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para inyectar automáticamente el Bearer token JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('gym_auth_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Interceptor de respuesta para manejar expiración de sesión
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Si el token expira o es inválido, limpiar storage si no estamos en login
      if (!window.location.pathname.includes('/login')) {
        console.warn('Sesión expirada o no autorizada');
      }
    }
    return Promise.reject(error);
  },
);
