import "./ServiceDetails.css";

function ServiceDetails({ service, onBook }) {
    return (
        <section>
            <h2>{service.name}</h2>

            <p>{service.description}</p>

            <button onClick={onBook}>Book Now</button>
        </section>
    );
}

export default ServiceDetails;