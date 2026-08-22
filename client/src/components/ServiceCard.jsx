import "./ServiceCard.css";

function ServiceCard({ name, description, onSelect }) {
    return (
        <div className="service-card">
            <h3>{name}</h3>
            <p>{description}</p>
            <button onClick={onSelect}>
                View Service
            </button>
        </div>
    );
}

export default ServiceCard;