import { useEffect, useState } from "react";
import "./ProviderProfile.css";

function ProviderProfile() {
    const [profile, setProfile] = useState(null);
    const [bio, setBio] = useState("");
    const [offeredServices, setOfferedServices] = useState([]);
    const [availableServices, setAvailableServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    useEffect(() => {
        async function loadProfile() {
            try {
                const [profileResponse, servicesResponse] = await Promise.all([
                    fetch("/api/provider-profile/me", {
                        credentials: "include",
                    }),
                    fetch("/api/services"),
                ]);

                const profileData = await profileResponse.json();
                const servicesData = await servicesResponse.json();

                if (!profileResponse.ok) {
                    throw new Error(
                        profileData.message || "Unable to load provider profile."
                    );
                }

                if (!servicesResponse.ok) {
                    throw new Error(
                        servicesData.message || "Unable to load services."
                    );
                }

                setProfile(profileData);
                setBio(profileData.bio || "");
                setOfferedServices(
                    profileData.offeredServices?.map((service) => service._id) || []
                );
                setAvailableServices(servicesData);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        }

        loadProfile();
    }, []);

    const handleServiceChange = (serviceId) => {
        setOfferedServices((current) =>
            current.includes(serviceId)
                ? current.filter((id) => id !== serviceId)
                : [...current, serviceId]
        );
    };

    const handleSave = async () => {
        setSaving(true);
        setError("");
        setMessage("");

        try {
            const response = await fetch("/api/provider-profile/me", {
                method: "PATCH",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    bio,
                    offeredServices,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Unable to update provider profile."
                );
            }

            setProfile(data.profile);
            setMessage("Profile updated successfully.");
        } catch (error) {
            setError(error.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <section className="provider-profile">
                <p>Loading profile...</p>
            </section>
        );
    }

    if (error && !profile) {
        return (
            <section className="provider-profile">
                <p>{error}</p>
            </section>
        );
    }

    return (
        <section className="provider-profile">
            <div className="provider-profile-card">
                <h1>My Provider Profile</h1>

                <div className="provider-profile-info">
                    <p>
                        <strong>Name:</strong>{" "}
                        {profile.user?.name || "Not available"}
                    </p>

                    <p>
                        <strong>Email:</strong>{" "}
                        {profile.user?.email || "Not available"}
                    </p>
                </div>

                <div className="provider-profile-statistics">
                    <div>
                        <strong>{profile.averageRating}</strong>
                        <span>Average Rating</span>
                    </div>

                    <div>
                        <strong>{profile.totalReviews}</strong>
                        <span>Total Reviews</span>
                    </div>

                    <div>
                        <strong>{profile.completedJobs}</strong>
                        <span>Completed Jobs</span>
                    </div>
                </div>

                <label>
                    Bio
                    <textarea
                        value={bio}
                        onChange={(event) => setBio(event.target.value)}
                        placeholder="Tell customers about your experience and services."
                        maxLength={1000}
                        rows={5}
                    />
                </label>

                <div className="provider-services">
                    <h2>Services Offered</h2>

                    {availableServices.map((service) => (
                        <label key={service.id || service._id}>
                            <input
                                type="checkbox"
                                checked={offeredServices.includes(
                                    service.id || service._id
                                )}
                                onChange={() =>
                                    handleServiceChange(
                                        service.id || service._id
                                    )
                                }
                            />
                            {service.name}
                        </label>
                    ))}
                </div>

                {error && <p>{error}</p>}
                {message && <p>{message}</p>}

                <button onClick={handleSave} disabled={saving}>
                    {saving ? "Saving..." : "Save Changes"}
                </button>
            </div>
        </section>
    );
}

export default ProviderProfile;