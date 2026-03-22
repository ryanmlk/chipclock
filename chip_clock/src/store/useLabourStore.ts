import { create } from 'zustand';
import { api } from "@/lib/api";
import { formatDateLocal } from "@/lib/dateUtils";

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
        const { lastFetched, loading, sales } = get();
        const todayStr = formatDateLocal(new Date());

        // Don't refetch matrix if already fetched today (unless forced)
        if (!force && lastFetched === todayStr && !loading) return;

        set({ loading: true });
        try {
            const matrixData = await api.labour.getMatrix();
            const kpiData = await api.labour.getSalesProjection(todayStr);

            set({
                matrix: Array.isArray(matrixData) ? matrixData : [],
                sales: {
                    current: kpiData?.actual_sales?.toString() || sales.current,
                    projection: kpiData?.sales_projection?.toString() || sales.projection,
                    actualHours: kpiData?.actual_hours?.toString() || sales.actualHours
                },
                lastFetched: todayStr
            });
        } catch (error) {
            console.error("Error fetching labour data:", error);
        } finally {
            set({ loading: false });
        }
    }
}));
