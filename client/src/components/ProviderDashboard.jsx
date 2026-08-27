import { useEffect, useState } from "react";
import { useAuth } from "../auth/useAuth";
import "./ProviderDashboard.css";

function ProviderDashboard() {
    const { user } = useAuth();
    const [availableJobs, setAvailableJobs] = useState([]);
    const [myJobs, setMyJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function fetchJobs() {
            try {
                const [availRes, myRes] = await Promise.all([
                    fetch("/api/bookings/available", { credentials: "include" }),
                    fetch("/api/bookings", { credentials: "include" })
                ]);
                
                if (!availRes.ok || !myRes.ok) throw new Error("Failed to fetch jobs.");
                
                const availData = await availRes.json();
                const myData = await myRes.json();
                
                setAvailableJobs(availData);
                setMyJobs(myData);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        if (user && user.role === "provider") {
            fetchJobs();
        }
    }, [user]);

    const handleAction = async (id, action) => {
        try {
            const res = await fetch(`/api/bookings/${id}/${action}`, {
                method: "PATCH",
                credentials: "include"
            });
            if (!res.ok) {
                const data = await res.json();
                alert(data.message || "Action failed");
                return;
            }
            // Refresh
            const [availRes, myRes] = await Promise.all([
                fetch("/api/bookings/available", { credentials: "include" }),
                fetch("/api/bookings", { credentials: "include" })
            ]);
            setAvailableJobs(await availRes.json());
            setMyJobs(await myRes.json());
        } catch (err) {
            alert("Error performing action.");
        }
    };

    if (!user || user.role !== "provider") {
        return <div className="provider-dashboard"><p>Access denied. Providers only.</p></div>;
    }

    if (loading) return <div className="provider-dashboard"><p>Loading jobs...</p></div>;
    if (error) return <div className="provider-dashboard"><p className="error">{error}</p></div>;

    return (
        <div className="provider-dashboard">
            <h2>Provider Dashboard</h2>

            <h3>My Assigned Jobs</h3>
            {myJobs.length === 0 ? <p>No assigned jobs.</p> : (
                <div className="jobs-list">
                    {myJobs.map((job) => (
                        <div key={job.id} className="job-card">
                            <h4>{job.service?.name}</h4>
                            <p><strong>Customer:</strong> {job.customer?.name}</p>
                            <p><strong>Time:</strong> {new Date(job.scheduledAt).toLocaleString()}</p>
                            <p><strong>Status:</strong> {job.status}</p>
                            {job.status === "confirmed" && (
                                <>
                                    <button onClick={() => handleAction(job.id, "complete")}>Mark Completed</button>
                                    <button onClick={() => handleAction(job.id, "cancel")} className="btn-cancel">Cancel Job</button>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            )}

            <h3>Available Jobs</h3>
            {availableJobs.length === 0 ? <p>No available jobs in your service area.</p> : (
                <div className="jobs-list">
                    {availableJobs.map((job) => (
                        <div key={job.id} className="job-card available-job">
                            <h4>{job.service?.name}</h4>
                            <p><strong>Customer:</strong> {job.customer?.name}</p>
                            <p><strong>Time:</strong> {new Date(job.scheduledAt).toLocaleString()}</p>
                            <button onClick={() => handleAction(job.id, "accept")}>Accept Job</button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default ProviderDashboard;
