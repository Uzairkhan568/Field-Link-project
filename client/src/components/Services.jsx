import { useState } from "react";
import "./Services.css";
import ServiceCard from "./ServiceCard";
import services from "../data/services";

function Services({ searchTerm }) {
    const [selectedService, setSelectedService] = useState("");

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
                            onSelect={() => setSelectedService(service.name)}
                        />
                    ))
                ) : (
                    <p className="no-services">No services found.</p>
                )}
            </div>
            {selectedService && (
                <p className="selected-service">
                    You selected: {selectedService}
                </p>
            )}
        </section>
    );
}

export default Services;