import { useState } from "react";
import "./Services.css";
import ServiceCard from "./ServiceCard";
import services from "../data/services";
import ServiceDetails from "./ServiceDetails";

function Services({ searchTerm }) {
    const [selectedService, setSelectedService] = useState("");
    const [bookingStarted, setBookingStarted] = useState(false);

    const filteredServices = services.filter((service) =>
        service.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <section>
            <h2>Popular Services</h2>

            <div className="services-grid">
                {filteredServices.length > 0 ? (
                    filteredServices.map((service) => (
                        <ServiceCard
                            key={service.id}
                            name={service.name}
                            description={service.description}
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
            {selectedService && (
                <ServiceDetails
                    service={selectedService}
                    onBook={() => setBookingStarted(true)}
                />
            )}

            {bookingStarted && (
                <p className="booking-message">
                    Booking process started for {selectedService.name}.
                </p>
            )}
        </section>
    );
}

export default Services;