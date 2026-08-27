import { useEffect, useState } from "react";
import { useAuth } from "../auth/useAuth";
import "./AdminDashboard.css";

function AdminDashboard() {
    const { user } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function fetchData() {
            try {
                const [bookRes, userRes] = await Promise.all([
                    fetch("/api/bookings", { credentials: "include" }),
                    fetch("/api/users", { credentials: "include" })
                ]);
                
                if (!bookRes.ok || !userRes.ok) throw new Error("Failed to fetch admin data.");
                
                const bookData = await bookRes.json();
                const userData = await userRes.json();
                
                setBookings(bookData);
                setUsers(userData);
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
        try {
            const res = await fetch(`/api/users/${userId}/role`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ role: newRole })
            });
            if (res.ok) {
                setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
                alert("Role updated successfully.");
            } else {
                alert("Failed to update role.");
            }
        } catch {
            alert("Error updating role.");
        }
    };

    if (!user || user.role !== "admin") {
        return <div className="admin-dashboard"><p>Access denied. Admins only.</p></div>;
    }

    if (loading) return <div className="admin-dashboard"><p>Loading dashboard...</p></div>;
    if (error) return <div className="admin-dashboard"><p className="error">{error}</p></div>;

    return (
        <div className="admin-dashboard">
            <h2>Admin Dashboard</h2>

            <section>
                <h3>All Bookings</h3>
                <div className="admin-list">
                    {bookings.map((b) => (
                        <div key={b.id} className="admin-card">
                            <p><strong>Service:</strong> {b.service?.name}</p>
                            <p><strong>Customer:</strong> {b.customer?.name} ({b.customer?.email})</p>
                            <p><strong>Provider:</strong> {b.provider?.name || "Unassigned"}</p>
                            <p><strong>Time:</strong> {new Date(b.scheduledAt).toLocaleString()}</p>
                            <p><strong>Status:</strong> {b.status}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section>
                <h3>User Management</h3>
                <div className="admin-list">
                    {users.map((u) => (
                        <div key={u._id} className="admin-card">
                            <p><strong>Name:</strong> {u.name}</p>
                            <p><strong>Email:</strong> {u.email}</p>
                            <p>
                                <strong>Role: </strong>
                                <select 
                                    value={u.role} 
                                    onChange={(e) => handleRoleChange(u._id, e.target.value)}
                                >
                                    <option value="customer">Customer</option>
                                    <option value="provider">Provider</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </p>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}

export default AdminDashboard;
