import { useState } from "react";
import "./BookingForm.css";

function BookingForm({ service }) {
    const [name, setName] = useState("");
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [error, setError] = useState("");
    const [submitted, setSubmitted] = useState(false);

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
                onClick={() => {
                    if (!name || !date || !time) {
                        setError("Please fill in all fields.");
                        return;
                    }

                    setError("");
                    setSubmitted(true);
                }}
            >
                Continue
            </button>

            {submitted && (
                <p>
                    Booking details submitted for {service.name}.
                </p>
            )}
        </section>
    );
}

export default BookingForm;