import { api } from "./api";

// Interfaces
export interface Company {
    nit: string;
    name: string;
    address: string;
    phone: string;
}

// Obtener todas las compañías
export const getCompanies = async (): Promise<Company[]> => {
    try {
        const response = await api.get('/companies');
        return response.data;
    } catch (error: any) {
        console.error('Error al obtener compañías:', error.message);
        throw error;
    }
};

// Obtener una compañía por ID
export const getCompanyById = async (id: number): Promise<Company> => {
    try {
        const response = await api.get(`/companies/${id}`);
        return response.data;
    } catch (error: any) {
        console.error(`Error al obtener la compañía ${id}:`, error.message);
        throw error;
    }
};

// Crear una nueva compañía
export const createCompany = async (company: Omit<Company, 'id' | 'created_at' | 'updated_at'>): Promise<Company> => {
    try {
        const response = await api.post('/companies', company);
        return response.data;
    } catch (error: any) {
        console.error('Error al crear la compañía:', error.message);
        throw error;
    }
};

// Actualizar una compañía
export const updateCompany = async (id: string, company: Partial<Company>): Promise<Company> => {
    try {
        const response = await api.put(`/companies/${id}`, company);
        return response.data;
    } catch (error: any) {
        console.error(`Error al actualizar la compañía ${id}:`, error.message);
        throw error;
    }
};

// Eliminar una compañía
export const deleteCompany = async (id: string): Promise<void> => {
    try {
        await api.delete(`/companies/${id}`);
    } catch (error: any) {
        console.error(`Error al eliminar la compañía ${id}:`, error.message);
        throw error;
    }
};
