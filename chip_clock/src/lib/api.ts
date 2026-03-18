export const api = {
    labour: {
        getMatrix: () => fetch("/api/labour/matrix").then(res => res.json()),
        getSalesProjection: (date: string) => fetch(`/api/labour/projection?date=${date}`).then(res => res.json()),
        saveKPI: (data: any) =>
            fetch("/api/labour/kpi", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            }).then(res => res.json()),
        getSchedule: (startDate: string, endDate: string) =>
            fetch(`/api/schedule?start_date=${startDate}&end_date=${endDate}`).then(res => res.json()),
        deleteShift: (id: string) =>
            fetch(`/api/schedule`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id }),
            }).then(res => res.json()),
    }
};
