import { api } from "./api";
import type { Company } from "./companie";

// Interfaces
export interface Product {
    code: string;
    name: string;
    features?: string;
    price_cop: number;
    price_usd: number;
    price_eur: number;
    company_nit: string;
    company?: Company;
}

// Obtener todos los productos
export const getProducts = async (): Promise<Product[]> => {
    try {
        const response = await api.get('/products');
        return response.data;
    } catch (error: any) {
        console.error('Error al obtener productos:', error.message);
        throw error;
    }
};

// Obtener un producto por código
export const getProductByCode = async (code: string): Promise<Product> => {
    try {
        const response = await api.get(`/products/${code}`);
        return response.data;
    } catch (error: any) {
        console.error(`Error al obtener el producto ${code}:`, error.message);
        throw error;
    }
};

// Crear un nuevo producto
export const createProduct = async (product: Omit<Product, 'company'>): Promise<Product> => {
    try {
        const response = await api.post('/products', product);
        return response.data;
    } catch (error: any) {
        console.error('Error al crear el producto:', error.message);
        throw error;
    }
};

// Actualizar un producto
export const updateProduct = async (code: string, product: Partial<Product>): Promise<Product> => {
    try {
        const response = await api.put(`/products/${code}`, product);
        return response.data;
    } catch (error: any) {
        console.error(`Error al actualizar el producto ${code}:`, error.message);
        throw error;
    }
};

// Eliminar un producto
export const deleteProduct = async (code: string): Promise<void> => {
    try {
        await api.delete(`/products/${code}`);
    } catch (error: any) {
        console.error(`Error al eliminar el producto ${code}:`, error.message);
        throw error;
    }
};

// Obtener productos por compañía
export const getProductsByCompany = async (companyNit: string): Promise<Product[]> => {
    try {
        const response = await api.get(`/products/company/${companyNit}`);
        return response.data;
    } catch (error: any) {
        console.error(`Error al obtener productos de la empresa ${companyNit}:`, error.message);
        throw error;
    }
};

// Actualizar precios de un producto
export const updateProductPrices = async (
    code: string, 
    prices: Pick<Product, 'price_cop' | 'price_usd' | 'price_eur'>
): Promise<Product> => {
    try {
        const response = await api.patch(`/products/${code}/prices`, prices);
        return response.data;
    } catch (error: any) {
        console.error(`Error al actualizar precios del producto ${code}:`, error.message);
        throw error;
    }
};
