import { useEffect, useState } from "react";
import { useAuth } from "../auth/useAuth";
import "./MyBookings.css";
import { formatBookedOn, groupBookingsByBookedDate } from "./bookingDisplay";

const CUSTOMER_CANCELLATION_WINDOW_MS = 15 * 60 * 1000;

function MyBookings() {
    const { user } = useAuth();

    const [bookings, setBookings] = useState([]);
    const [reviews, setReviews] = useState({});
    const [reviewForms, setReviewForms] = useState({});
    const [paymentLoading, setPaymentLoading] = useState({});
    const [cancellationLoading, setCancellationLoading] = useState({});
    const [currentTime, setCurrentTime] = useState(Date.now());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(Date.now());
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        async function fetchBookings() {
            try {
                const response = await fetch("/api/bookings", {
                    credentials: "include",
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch bookings.");
                }

                const data = await response.json();
                setBookings(data);

                const completedBookings = data.filter(
                    (booking) => booking.status === "completed"
                );

                const reviewResults = await Promise.all(
                    completedBookings.map(async (booking) => {
                        const reviewResponse = await fetch(
                            `/api/reviews/booking/${booking.id}`,
                            {
                                credentials: "include",
                            }
                        );

                        if (!reviewResponse.ok) {
                            return [booking.id, false];
                        }

                        const reviewData = await reviewResponse.json();

                        return [booking.id, reviewData];
                    })
                );

                setReviews(Object.fromEntries(reviewResults));
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        if (user) {
            fetchBookings();
        }
    }, [user]);

    function updateReviewForm(bookingId, field, value) {
        setReviewForms((current) => ({
            ...current,
            [bookingId]: {
                ...current[bookingId],
                [field]: value,
            },
        }));
    }

    async function submitReview(bookingId) {
        const form = reviewForms[bookingId] || {};

        const rating = Number(form.rating);
        const comment = form.comment || "";

        if (!rating) {
            setError("Please select a rating.");
            return;
        }

        try {
            const response = await fetch("/api/reviews", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    bookingId,
                    rating,
                    comment,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || "Unable to submit review.");
                return;
            }

            setReviews((current) => ({
                ...current,
                [bookingId]: {
                    reviewed: true,
                    review: data.review,
                },
            }));

            setReviewForms((current) => ({
                ...current,
                [bookingId]: {
                    rating: "",
                    comment: "",
                },
            }));

            setError("");
        } catch (err) {
            setError("Unable to connect to the server.");
        }
    }

    async function processPayment(bookingId, result) {
        setPaymentLoading((current) => ({
            ...current,
            [bookingId]: true,
        }));

        setError("");

        try {
            const response = await fetch("/api/payments/sandbox", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    bookingId,
                    result,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(
                    data.message || "Payment could not be processed."
                );
                return;
            }

            setBookings((current) =>
                current.map((booking) =>
                    booking.id === bookingId
                        ? {
                            ...booking,
                            paymentStatus:
                                data.booking.paymentStatus,
                        }
                        : booking
                )
            );
        } catch (err) {
            setError("Unable to connect to the payment server.");
        } finally {
            setPaymentLoading((current) => ({
                ...current,
                [bookingId]: false,
            }));
        }
    }

    async function cancelBooking(bookingId) {
        const confirmed = window.confirm(
            "Are you sure you want to cancel this booking?"
        );

        if (!confirmed) {
            return;
        }

        setCancellationLoading((current) => ({
            ...current,
            [bookingId]: true,
        }));

        setError("");

        try {
            const response = await fetch(
                `/api/bookings/${bookingId}/cancel`,
                {
                    method: "PATCH",
                    credentials: "include",
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setError(
                    data.message || "Unable to cancel booking."
                );
                return;
            }

            setBookings((current) =>
                current.map((booking) =>
                    booking.id === bookingId
                        ? {
                            ...booking,
                            status: "cancelled",
                        }
                        : booking
                )
            );
        } catch (err) {
            setError("Unable to connect to the server.");
        } finally {
            setCancellationLoading((current) => ({
                ...current,
                [bookingId]: false,
            }));
        }
    }

    function getCancellationTimeRemaining(booking) {
        if (
            !booking.createdAt ||
            !["pending", "confirmed"].includes(booking.status)
        ) {
            return 0;
        }

        const createdAt = new Date(booking.createdAt).getTime();

        if (Number.isNaN(createdAt)) {
            return 0;
        }

        const expiresAt =
            createdAt + CUSTOMER_CANCELLATION_WINDOW_MS;

        return Math.max(0, expiresAt - currentTime);
    }

    function formatRemainingTime(milliseconds) {
        const totalSeconds = Math.ceil(milliseconds / 1000);

        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;

        return `${minutes}:${seconds
            .toString()
            .padStart(2, "0")}`;
    }

    if (!user) {
        return (
            <div className="my-bookings">
                <p>Please log in to view your bookings.</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="my-bookings">
                <p>Loading bookings...</p>
            </div>
        );
    }

    if (error && bookings.length === 0) {
        return (
            <div className="my-bookings">
                <p className="error">{error}</p>
            </div>
        );
    }

    return (
        <div className="my-bookings">
            <h2>My Bookings</h2>

            {error && (
                <p className="error">{error}</p>
            )}

            {bookings.length === 0 ? (
                <p>You have no bookings yet.</p>
            ) : (
                <div className="bookings-list">
                    {groupBookingsByBookedDate(bookings).map((group) => (
                        <section key={group.date} className="booking-date-group">
                            <h3 className="booking-date-heading">Booked {group.date}</h3>
                            <div className="booking-date-list">
                                {group.bookings.map((booking) => {
                        const reviewData = reviews[booking.id];
                        const form = reviewForms[booking.id] || {};
                        const paymentStatus =
                            booking.paymentStatus || "pending";

                        const cancellationTimeRemaining =
                            getCancellationTimeRemaining(booking);

                        const canCancel =
                            cancellationTimeRemaining > 0 &&
                            ["pending", "confirmed"].includes(
                                booking.status
                            );

                        return (
                            <div
                                key={booking.id}
                                className={`booking-card status-${booking.status}`}
                            >
                                <h3>
                                    {booking.service?.name || "Service"}
                                </h3>

                                <p className="booking-reference">
                                    <strong>Booking ID:</strong>{" "}
                                    {booking.bookingReference || "Unavailable"}
                                </p>

                                <p className="booking-created-at">
                                    <strong>Booked on:</strong>{" "}
                                    {formatBookedOn(booking.createdAt)}
                                </p>

                                <p>
                                    <strong>Date:</strong>{" "}
                                    {new Date(
                                        booking.scheduledAt
                                    ).toLocaleDateString()}
                                </p>

                                <p>
                                    <strong>Time:</strong>{" "}
                                    {new Date(
                                        booking.scheduledAt
                                    ).toLocaleTimeString()}
                                </p>

                                {booking.address && (
                                    <p>
                                        <strong>Location:</strong>{" "}
                                        {booking.address.addressLine},{" "}
                                        {booking.address.city},{" "}
                                        {booking.address.state}{" "}
                                        {booking.address.postalCode}
                                    </p>
                                )}

                                <p>
                                    <strong>Status:</strong>{" "}
                                    <span className="status-badge">
                                        {booking.status}
                                    </span>
                                </p>

                                {/* CANCELLATION */}
                                {canCancel && (
                                    <div className="cancellation-section">
                                        <p>
                                            You can cancel this booking for{" "}
                                            <strong>
                                                {formatRemainingTime(
                                                    cancellationTimeRemaining
                                                )}
                                            </strong>
                                        </p>

                                        <button
                                            type="button"
                                            className="cancel-booking-button"
                                            disabled={
                                                cancellationLoading[
                                                booking.id
                                                ]
                                            }
                                            onClick={() =>
                                                cancelBooking(
                                                    booking.id
                                                )
                                            }
                                        >
                                            {cancellationLoading[
                                                booking.id
                                            ]
                                                ? "Cancelling..."
                                                : "Cancel Booking"}
                                        </button>
                                    </div>
                                )}

                                {/* PAYMENT */}
                                {booking.status !== "cancelled" && (
                                    <div className="payment-section">
                                        <h4>Payment</h4>

                                        <p>
                                            <strong>Status:</strong>{" "}
                                            <span
                                                className={`payment-status payment-${paymentStatus}`}
                                            >
                                                {paymentStatus}
                                            </span>
                                        </p>

                                        {paymentStatus !== "paid" && (
                                            <div className="payment-actions">
                                                <button
                                                    type="button"
                                                    className="pay-button"
                                                    disabled={
                                                        paymentLoading[
                                                        booking.id
                                                        ]
                                                    }
                                                    onClick={() =>
                                                        processPayment(
                                                            booking.id,
                                                            "success"
                                                        )
                                                    }
                                                >
                                                    {paymentLoading[
                                                        booking.id
                                                    ]
                                                        ? "Processing..."
                                                        : "Pay Now"}
                                                </button>

                                                <button
                                                    type="button"
                                                    className="payment-fail-button"
                                                    disabled={
                                                        paymentLoading[
                                                        booking.id
                                                        ]
                                                    }
                                                    onClick={() =>
                                                        processPayment(
                                                            booking.id,
                                                            "failure"
                                                        )
                                                    }
                                                >
                                                    Simulate Failure
                                                </button>
                                            </div>
                                        )}

                                        {paymentStatus === "paid" && (
                                            <p className="payment-success">
                                                ✓ Payment completed
                                            </p>
                                        )}
                                    </div>
                                )}

                                {/* REVIEW */}
                                {booking.status === "completed" && (
                                    <div className="review-section">
                                        {reviewData?.reviewed ? (
                                            <div className="review-submitted">
                                                <span className="review-check">
                                                    ✓
                                                </span>

                                                <div>
                                                    <strong>
                                                        Review submitted
                                                    </strong>

                                                    <p>
                                                        Thank you for rating
                                                        this service.
                                                    </p>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <h4>Leave a Review</h4>

                                                <div className="rating-group">
                                                    <span>Rating</span>

                                                    <div className="star-rating">
                                                        {[1, 2, 3, 4, 5].map(
                                                            (star) => (
                                                                <button
                                                                    key={star}
                                                                    type="button"
                                                                    className={
                                                                        star <=
                                                                            Number(
                                                                                form.rating
                                                                            )
                                                                            ? "star selected"
                                                                            : "star"
                                                                    }
                                                                    onClick={() =>
                                                                        updateReviewForm(
                                                                            booking.id,
                                                                            "rating",
                                                                            star
                                                                        )
                                                                    }
                                                                    aria-label={`${star} star`}
                                                                >
                                                                    ★
                                                                </button>
                                                            )
                                                        )}
                                                    </div>
                                                </div>

                                                <label className="review-label">
                                                    Comment

                                                    <textarea
                                                        value={
                                                            form.comment || ""
                                                        }
                                                        onChange={(event) =>
                                                            updateReviewForm(
                                                                booking.id,
                                                                "comment",
                                                                event.target.value
                                                            )
                                                        }
                                                        placeholder="Tell us about your experience."
                                                        rows="4"
                                                        maxLength="1000"
                                                    />
                                                </label>

                                                <button
                                                    type="button"
                                                    className="review-submit"
                                                    onClick={() =>
                                                        submitReview(
                                                            booking.id
                                                        )
                                                    }
                                                >
                                                    Submit Review
                                                </button>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                                })}
                            </div>
                        </section>
                    ))}
                </div>
            )}
        </div>
    );
}

export default MyBookings;