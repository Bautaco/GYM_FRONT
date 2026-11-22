import axios from 'axios';

/** Cliente HTTP compartido por todos los servicios de la aplicación. */
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Adjunta la sesión a cada petición que requiera autenticación.
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

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (!window.location.pathname.includes('/login')) {
        console.warn('Sesión expirada o no autorizada');
      }
    }
    return Promise.reject(error);
  },
);
