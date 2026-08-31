import { useEffect, useState } from "react";
import { useAuth } from "../auth/useAuth";
import "./ProviderDashboard.css";

function ProviderDashboard() {
    const { user } = useAuth();

    const [availableJobs, setAvailableJobs] = useState([]);
    const [myJobs, setMyJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [actionLoading, setActionLoading] = useState(null);

    async function fetchJobs() {
        try {
            const [availRes, myRes] = await Promise.all([
                fetch("/api/bookings/available", {
                    credentials: "include"
                }),
                fetch("/api/bookings", {
                    credentials: "include"
                })
            ]);

            if (!availRes.ok || !myRes.ok) {
                throw new Error("Failed to fetch jobs.");
            }

            const availData = await availRes.json();
            const myData = await myRes.json();

            setAvailableJobs(availData);
            setMyJobs(myData);
        } catch (err) {
            setError(err.message);
        }
    }

    useEffect(() => {
        if (!user || user.role !== "provider") {
            setLoading(false);
            return;
        }

        async function loadJobs() {
            await fetchJobs();
            setLoading(false);
        }

        loadJobs();
    }, [user]);

    async function handleAction(id, action) {
        if (actionLoading) {
            return;
        }

        setActionLoading(id);
        setError("");

        try {
            const response = await fetch(
                `/api/bookings/${id}/${action}`,
                {
                    method: "PATCH",
                    credentials: "include"
                }
            );

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(
                    data.message || "Action failed."
                );
            }

            /*
             * Immediately update the UI.
             */

            if (action === "accept") {
                setAvailableJobs((current) =>
                    current.filter((job) => job.id !== id)
                );
            }

            if (action === "complete") {
                setMyJobs((current) =>
                    current.map((job) =>
                        job.id === id
                            ? {
                                ...job,
                                status: "completed"
                            }
                            : job
                    )
                );
            }

            if (action === "cancel") {
                /*
                 * Cancelled jobs should never remain
                 * in either provider list.
                 */
                setAvailableJobs((current) =>
                    current.filter((job) => job.id !== id)
                );

                setMyJobs((current) =>
                    current.filter((job) => job.id !== id)
                );
            }

            /*
             * Get the authoritative state from the server.
             */
            await fetchJobs();
        } catch (err) {
            setError(err.message || "Error performing action.");
        } finally {
            setActionLoading(null);
        }
    }

    if (!user || user.role !== "provider") {
        return (
            <div className="provider-dashboard">
                <p>Access denied. Providers only.</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="provider-dashboard">
                <p>Loading jobs...</p>
            </div>
        );
    }

    return (
        <div className="provider-dashboard">
            <h2>Provider Dashboard</h2>

            {error && (
                <p className="error">{error}</p>
            )}

            <h3>My Assigned Jobs</h3>

            {myJobs.length === 0 ? (
                <p>No assigned jobs.</p>
            ) : (
                <div className="jobs-list">
                    {myJobs.map((job) => (
                        <div
                            key={job.id}
                            className="job-card"
                        >
                            <h4>{job.service?.name}</h4>

                            <p>
                                <strong>Customer:</strong>{" "}
                                {job.customer?.name}
                            </p>

                            <p>
                                <strong>Time:</strong>{" "}
                                {new Date(
                                    job.scheduledAt
                                ).toLocaleString()}
                            </p>

                            {job.address && (
                                <p>
                                    <strong>Location:</strong>{" "}
                                    {job.address.addressLine},{" "}
                                    {job.address.city},{" "}
                                    {job.address.state}{" "}
                                    {job.address.postalCode}
                                </p>
                            )}

                            <p>
                                <strong>Status:</strong>{" "}
                                {job.status}
                            </p>

                            {/* CONFIRMED */}
                            {job.status === "confirmed" && (
                                <button
                                    disabled={
                                        actionLoading === job.id
                                    }
                                    onClick={() =>
                                        handleAction(
                                            job.id,
                                            "complete"
                                        )
                                    }
                                >
                                    {actionLoading === job.id
                                        ? "Processing..."
                                        : "Mark Completed"}
                                </button>
                            )}

                            {/* COMPLETED */}
                            {job.status === "completed" && (
                                <p>
                                    <strong>
                                        Job completed.
                                    </strong>
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            )}

            <h3>Available Jobs</h3>

            {availableJobs.length === 0 ? (
                <p>
                    No available jobs in your service area.
                </p>
            ) : (
                <div className="jobs-list">
                    {availableJobs.map((job) => (
                        <div
                            key={job.id}
                            className="job-card available-job"
                        >
                            <h4>{job.service?.name}</h4>

                            <p>
                                <strong>Customer:</strong>{" "}
                                {job.customer?.name}
                            </p>

                            <p>
                                <strong>Time:</strong>{" "}
                                {new Date(
                                    job.scheduledAt
                                ).toLocaleString()}
                            </p>

                            {job.address && (
                                <p>
                                    <strong>Location:</strong>{" "}
                                    {job.address.addressLine},{" "}
                                    {job.address.city},{" "}
                                    {job.address.state}{" "}
                                    {job.address.postalCode}
                                </p>
                            )}

                            <div className="job-actions">
                                <button
                                    disabled={
                                        actionLoading === job.id
                                    }
                                    onClick={() =>
                                        handleAction(
                                            job.id,
                                            "accept"
                                        )
                                    }
                                >
                                    {actionLoading === job.id
                                        ? "Processing..."
                                        : "Accept Job"}
                                </button>

                                <button
                                    disabled={
                                        actionLoading === job.id
                                    }
                                    onClick={() =>
                                        handleAction(
                                            job.id,
                                            "cancel"
                                        )
                                    }
                                    className="btn-cancel"
                                >
                                    Cancel Job
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default ProviderDashboard;
