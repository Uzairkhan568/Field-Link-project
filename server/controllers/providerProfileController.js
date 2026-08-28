const ProviderProfile = require("../models/ProviderProfile");
const Service = require("../models/Service");

async function getMyProviderProfile(req, res) {
    const profile = await ProviderProfile.findOne({ user: req.user.id })
        .populate("user", "name email")
        .populate("offeredServices", "name slug description");

    if (!profile) {
        const err = new Error("Provider profile not found.");
        err.statusCode = 404;
        throw err;
    }

    res.status(200).json(profile);
}

async function updateMyProviderProfile(req, res) {
    const { bio, offeredServices } = req.body;

    if (bio !== undefined && typeof bio !== "string") {
        const err = new Error("Bio must be a string.");
        err.statusCode = 400;
        throw err;
    }

    if (bio !== undefined && bio.length > 1000) {
        const err = new Error("Bio cannot exceed 1000 characters.");
        err.statusCode = 400;
        throw err;
    }

    if (
        offeredServices !== undefined &&
        !Array.isArray(offeredServices)
    ) {
        const err = new Error("offeredServices must be an array.");
        err.statusCode = 400;
        throw err;
    }

    const profile = await ProviderProfile.findOne({
        user: req.user.id
    });

    if (!profile) {
        const err = new Error("Provider profile not found.");
        err.statusCode = 404;
        throw err;
    }

    if (bio !== undefined) {
        profile.bio = bio.trim();
    }

    if (offeredServices !== undefined) {
        const services = await Service.find({
            _id: { $in: offeredServices },
            isActive: true
        }).select("_id");

        if (services.length !== offeredServices.length) {
            const err = new Error(
                "One or more services are invalid or inactive."
            );
            err.statusCode = 400;
            throw err;
        }

        profile.offeredServices = offeredServices;
    }

    await profile.save();

    const updatedProfile = await ProviderProfile.findById(profile._id)
        .populate("user", "name email")
        .populate("offeredServices", "name slug description");

    res.status(200).json({
        message: "Provider profile updated successfully.",
        profile: updatedProfile
    });
}

async function getProviderProfiles(req, res) {
    const profiles = await ProviderProfile.find()
        .populate("user", "name")
        .populate("offeredServices", "name slug description");

    res.status(200).json(profiles);
}

module.exports = {
    getMyProviderProfile,
    updateMyProviderProfile,
    getProviderProfiles
};