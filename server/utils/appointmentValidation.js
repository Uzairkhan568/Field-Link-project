function validateAppointmentTime(scheduledAtString, timezoneString) {
    const scheduledAt = new Date(scheduledAtString);
    const now = new Date();

    if (scheduledAt.getTime() < now.getTime()) {
        const err = new Error("Appointments cannot be in the past.");
        err.statusCode = 400;
        throw err;
    }

    const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: timezoneString,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });

    const nowLocalStr = formatter.format(now);
    const scheduledLocalStr = formatter.format(scheduledAt);

    if (nowLocalStr === scheduledLocalStr) {
        // Same local calendar day. Apply 1-hour minimum lead time.
        const oneHourFromNow = now.getTime() + 60 * 60 * 1000;
        if (scheduledAt.getTime() < oneHourFromNow) {
            const err = new Error("Same-day appointments require at least 1 hour of advance notice.");
            err.statusCode = 400;
            throw err;
        }
    }
}

module.exports = { validateAppointmentTime };
