import { create } from "zustand";
import type { Product } from "@/services/products";
import { getProducts, createProduct } from "@/services/products";

interface ProductsState {
  products: Product[];
  loading: boolean;
  error: string | null;
  fetchProducts: () => Promise<void>;
  addProduct: (product: Omit<Product, "company">) => Promise<Product | null>;
}

export const useProducts = create<ProductsState>((set) => ({
  products: [],
  loading: false,
  error: null,
  fetchProducts: async () => {
    set({ loading: true, error: null });
    try {
      const data = await getProducts();
      set({ products: data, loading: false });
    } catch (error: any) {
      set({ error: error.message || "Error al cargar productos", loading: false });
    }
  },
  addProduct: async (product) => {
    set({ loading: true, error: null });
    try {
      const newProduct = await createProduct(product);
      set((state) => ({ products: [newProduct, ...state.products], loading: false }));
      return newProduct;
    } catch (error: any) {
      set({ error: error.message || "Error al crear producto", loading: false });
      return null;
    }
  },
}));
