const Service = require("../models/Service");

async function listActiveServices() {
    return Service.find({ isActive: true })
        .select("name slug description imageUrl")
        .sort({ name: 1 })
        .lean();
}

module.exports = { listActiveServices };