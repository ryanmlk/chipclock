/**
 * Extracts "HH:mm" directly from an ISO string, ignoring timezone shifts.
 */
export function formatTimeLocal(date: string | Date): string {
    const iso = typeof date === "string" ? date : date.toISOString();
    const parts = iso.split('T');
    if (parts.length < 2) return "";
    return parts[1].substring(0, 5);
}

/**
 * Extracts "yyyy-MM-dd" directly from an ISO string, ignoring timezone shifts.
 */
export function formatDateLocal(date: string | Date): string {
    const iso = typeof date === "string" ? date : date.toISOString();
    return iso.split('T')[0];
}
