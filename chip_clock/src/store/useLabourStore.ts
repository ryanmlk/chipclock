import { create } from 'zustand';
import { Shift } from "@/generated/prisma";
import { api } from "@/lib/api";
import { format } from "date-fns";

export interface MatrixItem {
    id: string;
    sales_level: number;
    hours_allowed: number;
}

interface LabourState {
    matrix: MatrixItem[];
    shifts: Shift[];
    sales: { current: string; projection: string; actualHours: string };
    loading: boolean;
    lastFetched: string | null;
    setMatrix: (matrix: MatrixItem[]) => void;
    setShifts: (shifts: Shift[]) => void;
    setSales: (sales: { current: string; projection: string; actualHours: string }) => void;
    setLoading: (loading: boolean) => void;
    fetchLabourData: (force?: boolean) => Promise<void>;
}

export const useLabourStore = create<LabourState>((set, get) => ({
    matrix: [],
    shifts: [],
    sales: { current: "", projection: "", actualHours: "" },
    loading: false,
    lastFetched: null,
    setMatrix: (matrix) => set({ matrix }),
    setShifts: (shifts) => set({ shifts }),
    setSales: (sales) => set({ sales }),
    setLoading: (loading) => set({ loading }),
    fetchLabourData: async (force = false) => {
        const { lastFetched, loading } = get();
        const today = format(new Date(), "yyyy-MM-dd");

        // Don't refetch if already fetched today (unless forced)
        if (!force && lastFetched === today && !loading) return;

        set({ loading: true });
        try {
            const [matrixData, shiftsData] = await Promise.all([
                api.labour.getMatrix(),
                api.labour.getSchedule(today, `${today}T23:59:59`)
            ]);

            set({
                matrix: Array.isArray(matrixData) ? matrixData : [],
                shifts: Array.isArray(shiftsData) ? shiftsData : [],
                lastFetched: today
            });
        } catch (error) {
            console.error("Error fetching labour data via store:", error);
        } finally {
            set({ loading: false });
        }
    }
}));
