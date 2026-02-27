import { format } from "date-fns";

/**
 * Formats a UTC date string or Date object into "HH:mm" in the browser's local timezone.
 */
export function formatTimeLocal(date: string | Date): string {
    const d = typeof date === "string" ? new Date(date) : date;
    if (isNaN(d.getTime())) return "";
    return format(d, "HH:mm");
}
