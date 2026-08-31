import { useEffect, useState } from "react";
import "./Services.css";
import ServiceCard from "./ServiceCard";
import { getServices } from "../data/services";
import ServiceDetails from "./ServiceDetails";
import BookingForm from "./BookingForm";

function Services({ searchTerm }) {
    const [services, setServices] = useState([]);
    const [selectedService, setSelectedService] = useState(null);
    const [bookingStarted, setBookingStarted] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState("");

    useEffect(() => {
        async function loadServices() {
            try {
                const data = await getServices();

                console.table(
                    data.map((service) => ({
                        name: service.name,
                        imageUrl: service.imageUrl,
                    }))
                );

                setServices(data);
            } catch (error) {
                setLoadError(error.message);
            } finally {
                setLoading(false);
            }
        }

        loadServices();
    }, []);

    const categories = [
        "all",
        ...services.map((service) => service.name),
    ];

    const filteredServices = services.filter((service) => {
        const matchesSearch = service.name
            .toLowerCase()
            .includes(searchTerm.toLowerCase());

        const matchesCategory =
            selectedCategory === "all" ||
            service.name === selectedCategory;

        return matchesSearch && matchesCategory;
    });

    const selectedServiceMatchesSearch =
        selectedService &&
        selectedService.name
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) &&
        (selectedCategory === "all" ||
            selectedService.name === selectedCategory);

    return (
        <section id="services">
            <h2>Popular Services</h2>

            <div className="service-filters">
                <label htmlFor="service-filter">
                    Filter by Service
                </label>

                <select
                    id="service-filter"
                    value={selectedCategory}
                    onChange={(event) => {
                        setSelectedCategory(event.target.value);
                        setSelectedService(null);
                        setBookingStarted(false);
                    }}
                >
                    {categories.map((category) => (
                        <option key={category} value={category}>
                            {category === "all"
                                ? "All Services"
                                : category}
                        </option>
                    ))}
                </select>

                {selectedCategory !== "all" && (
                    <button
                        type="button"
                        onClick={() => {
                            setSelectedCategory("all");
                            setSelectedService(null);
                            setBookingStarted(false);
                        }}
                    >
                        Clear Filter
                    </button>
                )}
            </div>

            <div className="services-grid">
                {loading ? (
                    <p className="no-services">
                        Loading services...
                    </p>
                ) : loadError ? (
                    <p className="no-services">{loadError}</p>
                ) : filteredServices.length > 0 ? (
                    filteredServices.map((service) => (
                        <ServiceCard
                            key={service.id}
                            name={service.name}
                            description={service.description}
                            imageUrl={service.imageUrl}
                            onSelect={() => {
                                setSelectedService(service);
                                setBookingStarted(false);
                            }}
                        />
                    ))
                ) : (
                    <p className="no-services">
                        No services found.
                    </p>
                )}
            </div>

            {selectedServiceMatchesSearch && (
                <ServiceDetails
                    service={selectedService}
                    onBook={() => setBookingStarted(true)}
                />
            )}

            {bookingStarted && (
                <BookingForm
                    service={selectedService}
                    onDone={() => {
                        setBookingStarted(false);
                        setSelectedService(null);
                    }}
                />
            )}
        </section>
    );
}

export default Services;