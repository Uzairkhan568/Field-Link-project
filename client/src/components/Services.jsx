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
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState("");

    useEffect(() => {
        async function loadServices() {
            try {
                const data = await getServices();
                setServices(data);
            } catch (error) {
                setLoadError(error.message);
            } finally {
                setLoading(false);
            }
        }

        loadServices();
    }, []);

    const filteredServices = services.filter((service) =>
        service.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const selectedServiceMatchesSearch =
        selectedService &&
        selectedService.name.toLowerCase().includes(searchTerm.toLowerCase());

    return (
        <section id="services">
            <h2>Popular Services</h2>

            <div className="services-grid">
                {loading ? (
                    <p className="no-services">Loading services...</p>
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
                    <p className="no-services">No services found.</p>
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