import { useState } from "react";
import "./Services.css";
import ServiceCard from "./ServiceCard";
import services from "../data/services";
import ServiceDetails from "./ServiceDetails";
import BookingForm from "./BookingForm";

function Services({ searchTerm }) {
    const [selectedService, setSelectedService] = useState("");
    const [bookingStarted, setBookingStarted] = useState(false);

    const filteredServices = services.filter((service) =>
        service.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const selectedServiceMatchesSearch =
        selectedService &&
        selectedService.name.toLowerCase().includes(searchTerm.toLowerCase());

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
                        setSelectedService("");
                    }}
                />
            )}
        </section>
    );
}

export default Services;