import axios from "axios";

export const URL = "http://localhost:8000";

// Crear instancia de axios con configuración base
export const api = axios.create({
  baseURL: URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para agregar el token a todas las peticiones
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Interceptor para manejar respuestas y errores
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      localStorage.removeItem('token');
      // Podrías redirigir al login aquí
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Interceptores para manejo de errores
api.interceptors.response.use(
  response => response,
  error => {
    if (!error.response) {
      console.error('Error de red:', error.message);
    } else {
      console.error('Error del servidor:', error.response.status, error.response.data);
    }
    throw error;
  }
);
