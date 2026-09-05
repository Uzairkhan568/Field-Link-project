import { useEffect, useState } from "react";
import { useAuth } from "../auth/useAuth";
import "./AdminDashboard.css";
import { formatBookedOn, groupBookingsByBookedDate } from "./bookingDisplay";

function AdminDashboard() {
    const { user } = useAuth();

    const [bookings, setBookings] = useState([]);
    const [users, setUsers] = useState([]);
    const [providers, setProviders] = useState([]);
    const [services, setServices] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [savingProvider, setSavingProvider] = useState(null);
    const [adminMessage, setAdminMessage] = useState("");
    const [adminMessageType, setAdminMessageType] = useState("success");

    useEffect(() => {
        async function fetchData() {
            try {
                const [
                    bookRes,
                    userRes,
                    providerRes,
                    serviceRes
                ] = await Promise.all([
                    fetch("/api/bookings", {
                        credentials: "include"
                    }),

                    fetch("/api/users", {
                        credentials: "include"
                    }),

                    fetch("/api/provider-profile/admin", {
                        credentials: "include"
                    }),

                    fetch("/api/services")
                ]);

                if (
                    !bookRes.ok ||
                    !userRes.ok ||
                    !providerRes.ok ||
                    !serviceRes.ok
                ) {
                    throw new Error("Failed to fetch admin data.");
                }

                const bookData = await bookRes.json();
                const userData = await userRes.json();
                const providerData = await providerRes.json();
                const serviceData = await serviceRes.json();

                setBookings(bookData);
                setUsers(userData);
                setProviders(providerData);
                setServices(serviceData);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        if (user && user.role === "admin") {
            fetchData();
        }
    }, [user]);

    const handleRoleChange = async (userId, newRole) => {
        setAdminMessage("");

        try {
            const res = await fetch(`/api/users/${userId}/role`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify({
                    role: newRole
                })
            });

            const data = await res.json();

            if (!res.ok) {
                setAdminMessageType("error");
                setAdminMessage(data.message || "Failed to update role.");
                return;
            }

            setUsers((currentUsers) =>
                currentUsers.map((u) =>
                    u._id === userId
                        ? { ...u, role: newRole }
                        : u
                )
            );

            setAdminMessageType("success");
            setAdminMessage("Role updated successfully.");
        } catch {
            setAdminMessageType("error");
            setAdminMessage("Error updating role.");
        }
    };

    const handleProviderServiceChange = (providerId, serviceId) => {
        setProviders((currentProviders) =>
            currentProviders.map((provider) => {
                if (provider._id !== providerId) {
                    return provider;
                }

                const currentServices = provider.offeredServices || [];

                const alreadyOffered = currentServices.some(
                    (service) =>
                        service._id === serviceId
                );

                let updatedServices;

                if (alreadyOffered) {
                    updatedServices = currentServices.filter(
                        (service) =>
                            service._id !== serviceId
                    );
                } else {
                    const serviceToAdd = services.find(
                        (service) =>
                            (service._id || service.id) === serviceId
                    );

                    if (!serviceToAdd) {
                        return provider;
                    }

                    updatedServices = [
                        ...currentServices,
                        {
                            _id: serviceToAdd._id || serviceToAdd.id,
                            name: serviceToAdd.name,
                            slug: serviceToAdd.slug,
                            description: serviceToAdd.description
                        }
                    ];
                }

                return {
                    ...provider,
                    offeredServices: updatedServices
                };
            })
        );
    };

    const handleSaveProviderServices = async (providerId) => {
        setSavingProvider(providerId);

        try {
            const provider = providers.find(
                (item) => item._id === providerId
            );

            if (!provider) {
                throw new Error("Provider not found.");
            }

            const offeredServices = (
                provider.offeredServices || []
            ).map((service) => service._id);

            const response = await fetch(
                `/api/provider-profile/admin/${providerId}`,
                {
                    method: "PATCH",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        offeredServices
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Unable to update provider services."
                );
            }

            setProviders((currentProviders) =>
                currentProviders.map((item) =>
                    item._id === providerId
                        ? data.profile
                        : item
                )
            );

            setAdminMessageType("success");
            setAdminMessage("Provider services updated successfully.");
        } catch (err) {
            setAdminMessageType("error");
            setAdminMessage(err.message);
        } finally {
            setSavingProvider(null);
        }
    };

    function renderBookingCard(b, statusLabel) {
        return (
            <div key={b.id} className="admin-card">
                <p>
                    <strong>Booking ID:</strong>{" "}
                    {b.bookingReference || "Unavailable"}
                </p>
                <p>
                    <strong>Service:</strong>{" "}
                    {b.service?.name}
                </p>
                <p>
                    <strong>Customer:</strong>{" "}
                    {b.customer?.name} ({b.customer?.email})
                </p>
                <p>
                    <strong>Provider:</strong>{" "}
                    {b.provider?.name || "Unassigned"}
                </p>
                <p>
                    <strong>Booked on:</strong>{" "}
                    {formatBookedOn(b.createdAt)}
                </p>
                <p>
                    <strong>Appointment:</strong>{" "}
                    {new Date(b.scheduledAt).toLocaleString()}
                </p>
                <p>
                    <strong>Status:</strong>{" "}
                    <span className={`badge badge-${b.status}`}>
                        {statusLabel}
                    </span>
                </p>
                <p>
                    <strong>Payment:</strong>{" "}
                    <span
                        className={`badge ${b.paymentStatus === "paid"
                            ? "badge-paid"
                            : b.paymentStatus === "failed"
                                ? "badge-failed"
                                : "badge-pending"
                        }`}
                    >
                        {b.paymentStatus || "Pending"}
                    </span>
                </p>
            </div>
        );
    }

    function renderBookingSection(status, title, statusLabel, emptyTitle, emptyBody) {
        const filteredBookings = bookings.filter((booking) => booking.status === status);

        return (
            <section className="admin-bookings-section">
                <h3>{title}</h3>

                {filteredBookings.length > 0 ? (
                    <div className="admin-booking-groups">
                        {groupBookingsByBookedDate(filteredBookings).map((group) => (
                            <div key={group.date} className="admin-booking-date-group">
                                <h4 className="admin-booking-date-heading">
                                    Booked {group.date}
                                </h4>
                                <div className="admin-list admin-booking-date-list">
                                    {group.bookings.map((booking) =>
                                        renderBookingCard(booking, statusLabel)
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-state">
                        <p className="empty-state-title">{emptyTitle}</p>
                        <p className="empty-state-body">{emptyBody}</p>
                    </div>
                )}
            </section>
        );
    }

    if (!user || user.role !== "admin") {
        return (
            <div className="admin-dashboard">
                <p>Access denied. Admins only.</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="admin-dashboard">
                <p>Loading dashboard...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="admin-dashboard">
                <p className="error">{error}</p>
            </div>
        );
    }

    return (
        <div className="admin-dashboard">
            <h2>Admin Dashboard</h2>

            {adminMessage && (
                <p className={`admin-feedback ${adminMessageType}`}>
                    {adminMessage}
                </p>
            )}

            {/* BOOKINGS */}
            {renderBookingSection("pending", "Pending Bookings", "Pending", "No pending bookings", "There are currently no bookings waiting for action.")}
            {renderBookingSection("completed", "Completed Bookings", "Completed", "No completed bookings", "Completed bookings will appear here.")}
            {renderBookingSection("cancelled", "Cancelled Bookings", "Cancelled", "No cancelled bookings", "Cancelled bookings will appear here.")}

            {/* USER MANAGEMENT */}

            <section>
                <h3>User Management</h3>

                <div className="admin-list">
                    {users.length === 0 ? (
                        <p>No users found.</p>
                    ) : (
                        users.map((u) => (
                            <div
                                key={u._id}
                                className="admin-card"
                            >
                                <p>
                                    <strong>Name:</strong>{" "}
                                    {u.name}
                                </p>

                                <p>
                                    <strong>Email:</strong>{" "}
                                    {u.email}
                                </p>

                                <p>
                                    <strong>Role:</strong>{" "}
                                    <select
                                        value={u.role}
                                        onChange={(event) =>
                                            handleRoleChange(
                                                u._id,
                                                event.target.value
                                            )
                                        }
                                    >
                                        <option value="customer">
                                            Customer
                                        </option>

                                        <option value="provider">
                                            Provider
                                        </option>

                                        <option value="admin">
                                            Admin
                                        </option>
                                    </select>
                                </p>
                            </div>
                        ))
                    )}
                </div>
            </section>

            {/* PROVIDER MANAGEMENT */}

            <section>
                <h3>Provider Management</h3>

                <div className="admin-list">
                    {providers.length === 0 ? (
                        <p>No providers found.</p>
                    ) : (
                        providers.map((provider) => (
                            <div
                                key={provider._id}
                                className="admin-card"
                            >
                                <h4>
                                    {provider.user?.name ||
                                        "Unnamed Provider"}
                                </h4>

                                <p>
                                    <strong>Email:</strong>{" "}
                                    {provider.user?.email ||
                                        "Not available"}
                                </p>

                                <p>
                                    <strong>Bio:</strong>{" "}
                                    {provider.bio ||
                                        "No bio provided."}
                                </p>

                                <p>
                                    <strong>Average Rating:</strong>{" "}
                                    {provider.averageRating ?? 0}
                                </p>

                                <p>
                                    <strong>Total Reviews:</strong>{" "}
                                    {provider.totalReviews ?? 0}
                                </p>

                                <p>
                                    <strong>Completed Jobs:</strong>{" "}
                                    {provider.completedJobs ?? 0}
                                </p>

                                <div>
                                    <h4>
                                        Services Offered
                                    </h4>

                                    {services.length === 0 ? (
                                        <p>
                                            No services available.
                                        </p>
                                    ) : (
                                        services.map((service) => {
                                            const serviceId =
                                                service._id ||
                                                service.id;

                                            const isOffered =
                                                (
                                                    provider.offeredServices ||
                                                    []
                                                ).some(
                                                    (offeredService) =>
                                                        offeredService._id ===
                                                        serviceId
                                                );

                                            return (
                                                <label
                                                    key={serviceId}
                                                    style={{
                                                        display:
                                                            "block"
                                                    }}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={
                                                            isOffered
                                                        }
                                                        onChange={() =>
                                                            handleProviderServiceChange(
                                                                provider._id,
                                                                serviceId
                                                            )
                                                        }
                                                    />

                                                    {" "}
                                                    {service.name}
                                                </label>
                                            );
                                        })
                                    )}
                                </div>

                                <button
                                    type="button"
                                    onClick={() =>
                                        handleSaveProviderServices(
                                            provider._id
                                        )
                                    }
                                    disabled={
                                        savingProvider ===
                                        provider._id
                                    }
                                >
                                    {savingProvider ===
                                        provider._id
                                        ? "Saving..."
                                        : "Save Services"}
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </section>
        </div>
    );
}

export default AdminDashboard;