import { api } from './api';

export interface InventoryItem {
  id: number;
  product_code: string;
  product_name: string;
  price_cop: number;
  price_usd: number;
  price_eur: number;
  company_nit: string;
  company_name: string;
  quantity: number;
}

export const getInventories = async (): Promise<InventoryItem[]> => {
  try {
    const response = await api.get('/inventory');
    return response.data;
  } catch (error: any) {
    console.error('Error al obtener inventarios:', error.message);
    throw error;
  }
};

