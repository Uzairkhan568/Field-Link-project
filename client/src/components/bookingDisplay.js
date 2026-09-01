export function formatBookedOn(createdAt) {
    if (!createdAt) {
        return "Unavailable";
    }

    const date = new Date(createdAt);

    if (Number.isNaN(date.getTime())) {
        return "Unavailable";
    }

    return date.toLocaleString();
}

export function groupBookingsByBookedDate(bookings) {
    const groups = new Map();

    [...bookings]
        .sort((a, b) => {
            const aTime = new Date(a.createdAt || 0).getTime();
            const bTime = new Date(b.createdAt || 0).getTime();
            return bTime - aTime;
        })
        .forEach((booking) => {
            const date = new Date(booking.createdAt || 0);
            const key = Number.isNaN(date.getTime())
                ? "unknown"
                : date.toLocaleDateString();

            if (!groups.has(key)) {
                groups.set(key, []);
            }

            groups.get(key).push(booking);
        });

    return [...groups.entries()].map(([date, items]) => ({
        date,
        bookings: items,
    }));
}
