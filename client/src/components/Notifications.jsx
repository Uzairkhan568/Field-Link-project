import { useEffect, useState } from "react";
import "./Notifications.css";

function Notifications() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    async function fetchNotifications() {
        try {
            const response = await fetch("/api/notifications", {
                credentials: "include",
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to load notifications."
                );
            }

            setNotifications(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchNotifications();
    }, []);

    function notifyNavbar() {
        window.dispatchEvent(new Event("notificationsUpdated"));
    }

    async function markAsRead(id) {
        try {
            const response = await fetch(
                `/api/notifications/${id}/read`,
                {
                    method: "PATCH",
                    credentials: "include",
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Failed to mark notification as read."
                );
            }

            setNotifications((current) =>
                current.map((notification) =>
                    notification._id === id
                        ? {
                            ...notification,
                            read: true,
                        }
                        : notification
                )
            );

            // Immediately update the Navbar badge
            notifyNavbar();
        } catch (err) {
            setError(err.message);
        }
    }

    async function markAllAsRead() {
        try {
            const response = await fetch(
                "/api/notifications/read-all",
                {
                    method: "PATCH",
                    credentials: "include",
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Failed to mark notifications as read."
                );
            }

            setNotifications((current) =>
                current.map((notification) => ({
                    ...notification,
                    read: true,
                }))
            );

            // Immediately update the Navbar badge
            notifyNavbar();
        } catch (err) {
            setError(err.message);
        }
    }

    const unreadCount = notifications.filter(
        (notification) => !notification.read
    ).length;

    function formatNotificationType(type) {
        const labels = {
            booking_created: "Booking created",
            booking_confirmed: "Booking confirmed",
            booking_cancelled: "Booking cancelled",
            booking_completed: "Booking completed",
            payment_success: "Payment successful",
            payment_failed: "Payment failed",
            review_received: "Review received",
        };

        if (labels[type]) {
            return labels[type];
        }

        return String(type || "Notification")
            .replace(/[_-]+/g, " ")
            .replace(/\b\w/g, (letter) => letter.toUpperCase());
    }

    if (loading) {
        return (
            <div className="notifications-page">
                <h2>Notifications</h2>
                <p>Loading notifications...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="notifications-page">
                <h2>Notifications</h2>
                <p className="notification-error">{error}</p>
            </div>
        );
    }

    return (
        <div className="notifications-page">
            <div className="notifications-header">
                <h2>Notifications</h2>

                {unreadCount > 0 && (
                    <button onClick={markAllAsRead}>
                        Mark all as read
                    </button>
                )}
            </div>

            {notifications.length === 0 ? (
                <p className="no-notifications">
                    You have no notifications.
                </p>
            ) : (
                <div className="notifications-list">
                    {notifications.map((notification) => (
                        <div
                            key={notification._id}
                            className={`notification-card ${notification.read
                                    ? "read"
                                    : "unread"
                                }`}
                        >
                            <div className="notification-content">
                                <p className="notification-message">
                                    {notification.message}
                                </p>

                                <p className="notification-type">
                                    {formatNotificationType(notification.type)}
                                </p>

                                <p className="notification-date">
                                    {new Date(
                                        notification.createdAt
                                    ).toLocaleString()}
                                </p>
                            </div>

                            {!notification.read && (
                                <button
                                    onClick={() =>
                                        markAsRead(notification._id)
                                    }
                                >
                                    Mark as read
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Notifications;