import { create } from 'zustand';
import { Shift, Employee } from "@/generated/prisma";
import { api } from "@/lib/api";
import { startOfWeek, addDays, addHours } from "date-fns";

type ShiftWithEmployee = Shift & { employee: Employee };

interface ScheduleState {
    shifts: ShiftWithEmployee[];
    loading: boolean;
    selectedDate: Date;
    view: "daily" | "weekly";
    cachedRange: { start: string; end: string } | null;
    setSelectedDate: (date: Date) => void;
    setView: (view: "daily" | "weekly") => void;
    fetchShifts: (options?: { start?: Date; end?: Date; force?: boolean }) => Promise<void>;
}

export const useScheduleStore = create<ScheduleState>((set, get) => ({
    shifts: [],
    loading: false,
    selectedDate: new Date(),
    view: "daily",
    cachedRange: null,
    setSelectedDate: (date) => set({ selectedDate: date }),
    setView: (view) => set({ view }),
    fetchShifts: async (options = {}) => {
        const { start: reqStart, end: reqEnd, force = false } = options;
        const { selectedDate, cachedRange, loading } = get();

        // Default to the full week containing selectedDate if no range provided
        const weekStart = startOfWeek(reqStart || selectedDate, { weekStartsOn: 1 });
        const start = reqStart || weekStart;
        let end = reqEnd || addDays(weekStart, 7);

        // Handle single day fetch (reqStart === reqEnd)
        if (reqStart && reqEnd && reqStart.getTime() === reqEnd.getTime()) {
            end = addHours(reqStart, 24);
        }

        // Smart Cache Check: Skip if requested range is within what we already have
        if (!force && cachedRange && !loading) {
            const cStart = new Date(cachedRange.start).getTime();
            const cEnd = new Date(cachedRange.end).getTime();
            if (start.getTime() >= cStart && end.getTime() <= cEnd) {
                return;
            }
        }

        set({ loading: true });
        try {
            const data = await api.labour.getSchedule(start.toISOString(), end.toISOString());
            set({
                shifts: Array.isArray(data) ? data : [],
                cachedRange: { start: start.toISOString(), end: end.toISOString() }
            });
        } catch (error) {
            console.error("Error fetching shifts:", error);
        } finally {
            set({ loading: false });
        }
    }
}));
