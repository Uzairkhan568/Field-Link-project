import "./ServiceDetails.css";

function ServiceDetails({ service, onBook }) {
    return (
        <section className="service-details">
            {service.imageUrl && (
                <img
                    src={service.imageUrl}
                    alt={`${service.name} service`}
                    className="service-details-image"
                />
            )}

            <h2>{service.name}</h2>

            <p>{service.description}</p>

            <button onClick={onBook}>Book Now</button>
        </section>
    );
}

export default ServiceDetails;