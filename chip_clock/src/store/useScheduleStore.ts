import { create } from 'zustand';
import { Shift, Employee } from "@/generated/prisma";
import { api } from "@/lib/api";
import { format, startOfWeek, addDays } from "date-fns";

type ShiftWithEmployee = Shift & { employee: Employee };

interface ScheduleState {
    shifts: ShiftWithEmployee[];
    loading: boolean;
    selectedDate: Date;
    view: "daily" | "weekly";
    lastFetchedRange: { start: string; end: string } | null;
    setSelectedDate: (date: Date) => void;
    setView: (view: "daily" | "weekly") => void;
    fetchShifts: (force?: boolean) => Promise<void>;
}

export const useScheduleStore = create<ScheduleState>((set, get) => ({
    shifts: [],
    loading: false,
    selectedDate: new Date(),
    view: "daily",
    lastFetchedRange: null,
    setSelectedDate: (date) => set({ selectedDate: date }),
    setView: (view) => set({ view }),
    fetchShifts: async (force = false) => {
        const { selectedDate, lastFetchedRange, loading } = get();

        const currentWeekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
        let start = startOfWeek(selectedDate, { weekStartsOn: 1 });

        // Ensure we don't fetch before the current week (matching existing logic)
        if (start < currentWeekStart) {
            start = currentWeekStart;
        }

        const end = addDays(start, 7);
        const startStr = start.toISOString();
        const endStr = end.toISOString();

        // Cache check
        if (!force && lastFetchedRange?.start === startStr && lastFetchedRange?.end === endStr && !loading) {
            return;
        }

        set({ loading: true });
        try {
            const data = await api.labour.getSchedule(startStr, endStr);
            set({
                shifts: Array.isArray(data) ? data : [],
                lastFetchedRange: { start: startStr, end: endStr }
            });
        } catch (error) {
            console.error("Error fetching shifts via store:", error);
        } finally {
            set({ loading: false });
        }
    }
}));
