export const api = {
    labour: {
        getMatrix: () => fetch("/api/labour/matrix").then(res => res.json()),
        getSchedule: (startDate: string, endDate: string) =>
            fetch(`/api/schedule?start_date=${startDate}&end_date=${endDate}`).then(res => res.json()),
    }
};
