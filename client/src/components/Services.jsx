import "./Services.css";
import ServiceCard from "./ServiceCard";

function Services() {
    return (
        <section>
            <h2>Popular Services</h2>

            <div className="services-grid">
                <ServiceCard
                    name="Plumbing"
                    description="Find reliable plumbing professionals."
                />

                <ServiceCard
                    name="Electrical"
                    description="Find trusted electrical professionals."
                />

                <ServiceCard
                    name="Cleaning"
                    description="Find professional cleaning services."
                />
            </div>
        </section>
    );
}

export default Services;