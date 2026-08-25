const { listActiveServices } = require("../services/serviceService");

async function getServices(req, res) {
    const services = await listActiveServices();

    res.status(200).json(
        services.map((service) => ({
            id: service._id.toString(),
            name: service.name,
            slug: service.slug,
            description: service.description,
        }))
    );
}

module.exports = { getServices };
