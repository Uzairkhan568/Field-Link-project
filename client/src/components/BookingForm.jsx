import { useState } from "react";
import "./BookingForm.css";

function BookingForm({ service, onDone }) {
    const [name, setName] = useState("");
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [error, setError] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (submitting || submitted) {
            return;
        }

        if (!name || !date || !time) {
            setError("Please fill in all fields.");
            return;
        }

        setSubmitting(true);
        setError("");

        try {
            const response = await fetch("http://localhost:5000/api/bookings", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name,
                    service: service.name,
                    date,
                    time,
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
                    <p>Name: {name}</p>
                    <p>Date: {date}</p>
                    <p>Time: {time}</p>

                    <p>Your booking request has been submitted.</p>

                    <button onClick={onDone}>
                        Done
                    </button>
                </div>
            </section>
        );
    }

    return (
        <section className="booking-form">
            <h2>Book {service.name}</h2>

            <label>
                Your Name
                <input
                    type="text"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                />
            </label>

            <label>
                Preferred Date
                <input
                    type="date"
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