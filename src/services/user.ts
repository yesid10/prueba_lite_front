import { api } from "./api";

export interface User {
  email: string;
  role: string;
}

interface LoginResponse {
  user: User;
  access_token: string;
}

export const login = async (
  email: string,
  password: string
): Promise<User> => {
  try {
    const response = await api.post<LoginResponse>(`/auth/login`, {
      email,
      password,
    });
    
    // Guardar el token en localStorage si lo necesitas
    if (response.data.access_token) {
      localStorage.setItem('token', response.data.access_token);
    }
    
    console.log(response);
    return response.data.user;
  } catch (error: any) {
    console.error('Error en login:', error.response?.data || error.message);
    throw error;
  }
};

// Función para verificar el token
export const verifyToken = async (): Promise<boolean> => {
  try {
    const response = await api.get('/auth/verify');
    return response.status === 200;
  } catch {
    return false;
  }
};

// Función para cerrar sesión
export const logout = async (): Promise<void> => {
  try {
    await api.post('/auth/logout');
    localStorage.removeItem('token');
  } catch (error: any) {
    console.error('Error en logout:', error.response?.data || error.message);
    throw error;
  }
};
