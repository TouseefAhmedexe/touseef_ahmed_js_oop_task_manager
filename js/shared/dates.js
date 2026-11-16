export function todayIso() {
    return new Date().toISOString().slice(0, 10);
}

export function addDaysIso(offset) {
    const date = new Date();

    date.setDate(date.getDate() + offset);
    return date.toISOString().slice(0, 10);
}

export function formatDate(isoDate) {
    return new Date(isoDate).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "UTC"
    });
}

export function formatDateTime(isoDateTime) {
    return new Date(isoDateTime).toLocaleString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}