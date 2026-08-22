import { useState } from "react";
import "./Services.css";
import ServiceCard from "./ServiceCard";

function Services() {
    const [selectedService, setSelectedService] = useState("");
    return (
        <section>
            <h2>Popular Services</h2>

            <div className="services-grid">
                <ServiceCard
                    name="Plumbing"
                    description="Find reliable plumbing professionals."
                    onSelect={() => setSelectedService("Plumbing")}
                />

                <ServiceCard
                    name="Electrical"
                    description="Find trusted electrical professionals."
                    onSelect={() => setSelectedService("Electrical")}
                />

                <ServiceCard
                    name="Cleaning"
                    description="Find professional cleaning services."
                    onSelect={() => setSelectedService("Cleaning")}
                />
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