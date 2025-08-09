import { create } from "zustand";
import type { Company } from "@/services/companie";
import { 
    getCompanies,
    createCompany,
    updateCompany,
    deleteCompany
} from "@/services/companie";

interface CompaniesState {
    // Estado
    companies: Company[];
    loading: boolean;
    error: string | null;
    selectedCompany: Company | null;

    // Acciones
    fetchCompanies: () => Promise<void>;
    addCompany: (company: Omit<Company, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
    updateCompany: (nit: string, company: Partial<Company>) => Promise<void>;
    removeCompany: (nit: string) => Promise<void>;
    setSelectedCompany?: (company: Company | null) => void;
    clearError?: () => void;
}

export const useCompanies = create<CompaniesState>((set) => ({
    // Estado inicial
    companies: [],
    loading: false,
    error: null,
    selectedCompany: null,

    // Acciones
    fetchCompanies: async () => {
        try {
            set({ loading: true, error: null });
            const data = await getCompanies();
            set({ companies: data, loading: false });
        } catch (error: any) {
            set({ 
                error: error.message || 'Error al cargar las compañías',
                loading: false 
            });
        }
    },

    addCompany: async (company) => {
        try {
            set({ loading: true, error: null });
            const newCompany = await createCompany(company);
            set(state => ({ 
                companies: [...state.companies, newCompany],
                loading: false 
            }));
        } catch (error: any) {
            set({ 
                error: error.message || 'Error al crear la compañía',
                loading: false 
            });
            throw error;
        }
    },

    // addCompany: async (company) => {
    //     try {
    //         set({ loading: true, error: null });
    //         const newCompany = await createCompany(company);
    //         set(state => ({ 
    //             companies: [...state.companies, newCompany],
    //             loading: false 
    //         }));
    //     } catch (error: any) {
    //         set({ 
    //             error: error.message || 'Error al crear la compañía',
    //             loading: false 
    //         });
    //     }
    // },

    updateCompany: async (nit: string, companyData: Partial<Company>) => {
        try {
            set({ loading: true, error: null });
            const updatedCompany = await updateCompany(nit, companyData);
            set(state => ({
                companies: state.companies.map(company => 
                    company.nit === nit ? updatedCompany : company
                ),
                loading: false
            }));
        } catch (error: any) {
            set({ 
                error: error.message || 'Error al actualizar la compañía',
                loading: false 
            });
        }
    },

    removeCompany: async (nit: string) => {
        try {
            set({ loading: true, error: null });
            await deleteCompany(nit);
            set(state => ({
                companies: state.companies.filter(company => company.nit !== nit),
                loading: false
            }));
        } catch (error: any) {
            set({ 
                error: error.message || 'Error al eliminar la compañía',
                loading: false 
            });
        }
    },

    // setSelectedCompany: (company) => {
    //     set({ selectedCompany: company });
    // },

    // clearError: () => {
    //     set({ error: null });
    // }
}));
