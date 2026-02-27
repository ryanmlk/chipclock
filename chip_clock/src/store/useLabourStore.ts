import { create } from 'zustand';
import { api } from "@/lib/api";
import { formatTimeLocal } from "@/lib/dateUtils";

export interface MatrixItem {
    id: string;
    sales_level: number;
    hours_allowed: number;
}

interface LabourState {
    matrix: MatrixItem[];
    sales: { current: string; projection: string; actualHours: string };
    loading: boolean;
    lastFetched: string | null;
    setMatrix: (matrix: MatrixItem[]) => void;
    setSales: (sales: { current: string; projection: string; actualHours: string }) => void;
    setLoading: (loading: boolean) => void;
    fetchLabourData: (force?: boolean) => Promise<void>;
}

export const useLabourStore = create<LabourState>((set, get) => ({
    matrix: [],
    sales: { current: "", projection: "", actualHours: "" },
    loading: false,
    lastFetched: null,
    setMatrix: (matrix) => set({ matrix }),
    setSales: (sales) => set({ sales }),
    setLoading: (loading) => set({ loading }),
    fetchLabourData: async (force = false) => {
        const { lastFetched, loading } = get();
        const today = formatTimeLocal(new Date());

        // Don't refetch matrix if already fetched today (unless forced)
        if (!force && lastFetched === today && !loading) return;

        set({ loading: true });
        try {
            const matrixData = await api.labour.getMatrix();
            set({
                matrix: Array.isArray(matrixData) ? matrixData : [],
                lastFetched: today
            });
        } catch (error) {
            console.error("Error fetching labour matrix:", error);
        } finally {
            set({ loading: false });
        }
    }
}));
