
import { login } from "@/services/user";
import { create } from "zustand";

type User = {
    email: string;
    role: string;
};

type AuthState = {
    user: User | null;
    isAuthenticated: boolean;
    error: string | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
};

export const userAuth = create<AuthState>((set) => ({
    user: null,
    isAuthenticated: false,
    error: null,
    loading: false,
    login: async (email: string, password: string) => {
        try {
            set({ loading: true, error: null });
            const data = await login(email, password);
            set({ user: data, isAuthenticated: true, loading: false });
        } catch (error: any) {
            set({ error: error.message, loading: false });
        }
    },
}));
