import { useEffect, useState } from "react";
import "./Providers.css";

function Providers() {
    const [providers, setProviders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadProviders() {
            try {
                const response = await fetch("/api/provider-profile", {
                    credentials: "include",
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.message || "Unable to load providers."
                    );
                }

                setProviders(data);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        }

        loadProviders();
    }, []);

    if (loading) {
        return (
            <section className="providers-page">
                <p>Loading providers...</p>
            </section>
        );
    }

    if (error) {
        return (
            <section className="providers-page">
                <p>{error}</p>
            </section>
        );
    }

    return (
        <section className="providers-page">
            <h1>Service Providers</h1>

            {providers.length === 0 ? (
                <p>No service providers available.</p>
            ) : (
                <div className="providers-grid">
                    {providers.map((provider) => (
                        <article
                            className="provider-card"
                            key={provider._id}
                        >
                            <h2>{provider.user?.name || "Provider"}</h2>

                            <div className="provider-stats">
                                <span>
                                    ⭐ {provider.averageRating.toFixed(1)}
                                </span>

                                <span>
                                    {provider.totalReviews} Reviews
                                </span>

                                <span>
                                    {provider.completedJobs} Jobs
                                </span>
                            </div>

                            <p className="provider-bio">
                                {provider.bio ||
                                    "This provider has not added a bio yet."}
                            </p>

                            <div className="provider-services">
                                <h3>Services Offered</h3>

                                {provider.offeredServices?.length > 0 ? (
                                    <div className="service-tags">
                                        {provider.offeredServices.map(
                                            (service) => (
                                                <span key={service._id}>
                                                    {service.name}
                                                </span>
                                            )
                                        )}
                                    </div>
                                ) : (
                                    <p>No services listed.</p>
                                )}
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </section>
    );
}

export default Providers;