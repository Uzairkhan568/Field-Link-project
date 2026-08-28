import { useEffect, useState } from "react";
import "./Navbar.css";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";

function Navbar() {
    const { user, logout, loading } = useAuth();
    const navigate = useNavigate();

    const [unreadCount, setUnreadCount] = useState(0);

    async function fetchUnreadCount() {
        if (!user) {
            setUnreadCount(0);
            return;
        }

        try {
            const response = await fetch(
                "/api/notifications/unread-count",
                {
                    credentials: "include",
                }
            );

            if (!response.ok) {
                return;
            }

            const data = await response.json();
            setUnreadCount(data.count);
        } catch (error) {
            console.error(
                "Failed to fetch notification count:",
                error
            );
        }
    }

    useEffect(() => {
        if (!loading) {
            fetchUnreadCount();
        }
    }, [user, loading]);

    useEffect(() => {
        function handleFocus() {
            fetchUnreadCount();
        }

        function handleNotificationsUpdated() {
            fetchUnreadCount();
        }

        window.addEventListener("focus", handleFocus);

        window.addEventListener(
            "notificationsUpdated",
            handleNotificationsUpdated
        );

        return () => {
            window.removeEventListener("focus", handleFocus);

            window.removeEventListener(
                "notificationsUpdated",
                handleNotificationsUpdated
            );
        };
    }, [user]);

    async function handleLogout() {
        await logout();
        navigate("/");
    }

    return (
        <nav>
            <h2>
                <Link to="/">WEFiX</Link>
            </h2>

            <div className="nav-links">
                <Link to="/">Home</Link>

                <a href="/#services">Services</a>

                {!loading &&
                    (user ? (
                        <>
                            {user.role === "customer" && (
                                <>
                                    <Link to="/providers">
                                        Providers
                                    </Link>

                                    <Link to="/my-bookings">
                                        My Bookings
                                    </Link>
                                </>
                            )}

                            {user.role === "provider" && (
                                <Link to="/dashboard">
                                    Dashboard
                                </Link>
                            )}

                            {user.role === "admin" && (
                                <Link to="/admin">
                                    Admin
                                </Link>
                            )}

                            <Link
                                to="/notifications"
                                className="nav-notifications"
                            >
                                🔔 Notifications

                                {unreadCount > 0 && (
                                    <span className="notification-count">
                                        {unreadCount}
                                    </span>
                                )}
                            </Link>

                            {user.role === "provider" ? (
                                <Link
                                    to="/provider-profile"
                                    className="nav-user"
                                >
                                    Hi, {user.name}
                                </Link>
                            ) : (
                                <span className="nav-user">
                                    Hi, {user.name}
                                </span>
                            )}

                            <button
                                type="button"
                                onClick={handleLogout}
                            >
                                Log out
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login">
                                Log in
                            </Link>

                            <Link to="/register">
                                Create account
                            </Link>
                        </>
                    ))}
            </div>
        </nav>
    );
}

export default Navbar;
