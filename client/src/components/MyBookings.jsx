import { useEffect, useState } from "react";
import { useAuth } from "../auth/useAuth";
import "./MyBookings.css";

function MyBookings() {
    const { user } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

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

    if (!user) {
        return <div className="my-bookings"><p>Please log in to view your bookings.</p></div>;
    }

    if (loading) return <div className="my-bookings"><p>Loading bookings...</p></div>;
    if (error) return <div className="my-bookings"><p className="error">{error}</p></div>;

    return (
        <div className="my-bookings">
            <h2>My Bookings</h2>
            {bookings.length === 0 ? (
                <p>You have no bookings yet.</p>
            ) : (
                <div className="bookings-list">
                    {bookings.map((booking) => (
                        <div key={booking.id} className={`booking-card status-${booking.status}`}>
                            <h3>{booking.service?.name || "Service"}</h3>
                            <p><strong>Date:</strong> {new Date(booking.scheduledAt).toLocaleDateString()}</p>
                            <p><strong>Time:</strong> {new Date(booking.scheduledAt).toLocaleTimeString()}</p>
                            {booking.address && (
                                <p><strong>Location:</strong> {booking.address.addressLine}, {booking.address.city}, {booking.address.state} {booking.address.postalCode}</p>
                            )}
                            <p><strong>Status:</strong> <span className="status-badge">{booking.status}</span></p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default MyBookings;
