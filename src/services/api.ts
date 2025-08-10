import axios from "axios";

// ✅ Variable de entorno correcta para Vite
export const URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// Crear instancia de axios con configuración base
export const api = axios.create({
  baseURL: URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para agregar el token a todas las peticiones
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  }, 
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor combinado para manejar respuestas y errores
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Manejo de errores de autenticación
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
      return Promise.reject(error);
    }
    
    // Manejo de errores de red y servidor
    if (!error.response) {
      console.error('Error de red:', error.message);
    } else {
      console.error('Error del servidor:', error.response.status, error.response.data);
    }
    
    return Promise.reject(error);
  }
);