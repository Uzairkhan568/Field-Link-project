import "./ServiceCard.css";

function ServiceCard({ name, description, imageUrl, onSelect }) {
    return (
        <div className="service-card">
            {imageUrl && (
                <img
                    src={imageUrl}
                    alt={`${name} service`}
                    className="service-card-image"
                />
            )}

            <h3>{name}</h3>
            <p>{description}</p>

            <button onClick={onSelect}>
                View Service
            </button>
        </div>
    );
}

export default ServiceCard;