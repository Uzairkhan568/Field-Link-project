import { useState } from "react";
import { useAuth } from "../auth/useAuth";
import "./BookingForm.css";

function BookingForm({ service, onDone }) {
    const { user } = useAuth();
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [error, setError] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    if (!user) {
        return (
            <section className="booking-form">
                <div className="booking-confirmation">
                    <h3>Authentication Required</h3>
                    <p>Please log in or register to book a service.</p>
                    <button onClick={onDone}>Close</button>
                </div>
            </section>
        );
    }

    const handleSubmit = async () => {
        if (submitting || submitted) {
            return;
        }

        if (!date || !time) {
            setError("Please fill in all fields.");
            return;
        }

        const bookingDateTime = new Date(`${date}T${time}`);

        if (isNaN(bookingDateTime.getTime())) {
            setError("Invalid booking date or time.");
            return;
        }

        const now = new Date();
        if (bookingDateTime.getTime() < now.getTime()) {
            setError("Appointments cannot be in the past.");
            return;
        }

        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const formatter = new Intl.DateTimeFormat('en-US', {
            timeZone: timezone,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });

        const nowLocalStr = formatter.format(now);
        const scheduledLocalStr = formatter.format(bookingDateTime);

        if (nowLocalStr === scheduledLocalStr) {
            const oneHourFromNow = now.getTime() + 60 * 60 * 1000;
            if (bookingDateTime.getTime() < oneHourFromNow) {
                setError("Same-day appointments require at least 1 hour of advance notice.");
                return;
            }
        }

        setSubmitting(true);
        setError("");

        try {
            const response = await fetch("/api/bookings", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    serviceId: service.id,
                    scheduledAt: bookingDateTime.toISOString(),
                    timezone: timezone
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.message);
                setSubmitting(false);
                return;
            }

            setSubmitted(true);
            setSubmitting(false);
        } catch (error) {
            setError("Unable to connect to the server.");
            setSubmitting(false);
        }
    };

    if (submitted) {
        return (
            <section className="booking-form">
                <div className="booking-confirmation">
                    <h3>Booking Confirmed</h3>
                    <p>Service: {service.name}</p>
                    <p>Date: {date}</p>
                    <p>Time: {time}</p>
                    <p>Your booking request has been submitted successfully.</p>
                    <button onClick={onDone}>Done</button>
                </div>
            </section>
        );
    }

    return (
        <section className="booking-form">
            <h2>Book {service.name}</h2>

            <label>
                Preferred Date
                <input
                    type="date"
                    min={new Date().toISOString().split("T")[0]}
                    value={date}
                    onChange={(event) => setDate(event.target.value)}
                />
            </label>

            <label>
                Preferred Time
                <input
                    type="time"
                    value={time}
                    onChange={(event) => setTime(event.target.value)}
                />
            </label>

            {error && <p>{error}</p>}

            <button
                disabled={submitting}
                onClick={handleSubmit}
            >
                {submitting ? "Submitting..." : "Continue"}
            </button>
        </section>
    );
}

export default BookingForm;
