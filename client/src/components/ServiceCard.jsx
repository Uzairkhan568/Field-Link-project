import "./ServiceCard.css";

function ServiceCard({ name, description }) {
    return (
        <div className="service-card">
            <h3>{name}</h3>
            <p>{description}</p>
        </div>
    );
}

export default ServiceCard;