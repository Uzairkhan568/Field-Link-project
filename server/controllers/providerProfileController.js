const ProviderProfile = require("../models/ProviderProfile");
const Service = require("../models/Service");
const Booking = require("../models/Booking");

async function getMyProviderProfile(req, res) {
    const profile = await ProviderProfile.findOne({
        user: req.user.id
    })
        .populate("user", "name email")
        .populate(
            "offeredServices",
            "name slug description"
        );

    if (!profile) {
        const err = new Error(
            "Provider profile not found."
        );
        err.statusCode = 404;
        throw err;
    }

    const profileData = profile.toObject();

    // Derive completed jobs from bookings so this value cannot become stale.
    profileData.completedJobs = await Booking.countDocuments({
        provider: req.user.id,
        status: "completed"
    });

    res.status(200).json(profileData);
}

async function updateMyProviderProfile(req, res) {
    const { name, bio, offeredServices } = req.body;

    if (name !== undefined && typeof name !== "string") {
        const err = new Error("Name must be a string.");
        err.statusCode = 400;
        throw err;
    }

    if (name !== undefined && name.trim().length === 0) {
        const err = new Error("Name is required.");
        err.statusCode = 400;
        throw err;
    }

    if (name !== undefined && name.length > 100) {
        const err = new Error(
            "Name cannot exceed 100 characters."
        );
        err.statusCode = 400;
        throw err;
    }

    if (bio !== undefined && typeof bio !== "string") {
        const err = new Error("Bio must be a string.");
        err.statusCode = 400;
        throw err;
    }

    if (bio !== undefined && bio.length > 1000) {
        const err = new Error(
            "Bio cannot exceed 1000 characters."
        );
        err.statusCode = 400;
        throw err;
    }

    if (
        offeredServices !== undefined &&
        !Array.isArray(offeredServices)
    ) {
        const err = new Error(
            "offeredServices must be an array."
        );
        err.statusCode = 400;
        throw err;
    }

    const profile = await ProviderProfile.findOne({
        user: req.user.id
    });

    if (!profile) {
        const err = new Error(
            "Provider profile not found."
        );
        err.statusCode = 404;
        throw err;
    }

    if (name !== undefined) {
        req.user.name = name.trim();
        await req.user.save();
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

    const updatedProfile =
        await ProviderProfile.findById(profile._id)
            .populate("user", "name email")
            .populate(
                "offeredServices",
                "name slug description"
            );

    res.status(200).json({
        message: "Provider profile updated successfully.",
        profile: updatedProfile
    });
}


/*
 * ADMIN
 * Get all provider profiles
 */
async function getProviderProfilesForAdmin(req, res) {
    const profiles = await ProviderProfile.find()
        .populate("user", "name email role isActive")
        .populate(
            "offeredServices",
            "name slug description"
        );

    const profilesWithCompletedJobs = await Promise.all(
        profiles.map(async (profile) => {
            const profileData = profile.toObject();

            profileData.completedJobs = await Booking.countDocuments({
                provider: profile.user._id,
                status: "completed"
            });

            return profileData;
        })
    );

    res.status(200).json(profilesWithCompletedJobs);
}


/*
 * ADMIN
 * Update services offered by a provider
 */
async function updateProviderServicesByAdmin(req, res) {
    const { providerId } = req.params;
    const { offeredServices } = req.body;

    if (!Array.isArray(offeredServices)) {
        const err = new Error(
            "offeredServices must be an array."
        );
        err.statusCode = 400;
        throw err;
    }

    const profile = await ProviderProfile.findById(
        providerId
    );

    if (!profile) {
        const err = new Error(
            "Provider profile not found."
        );
        err.statusCode = 404;
        throw err;
    }

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

    await profile.save();

    const updatedProfile =
        await ProviderProfile.findById(profile._id)
            .populate(
                "user",
                "name email role isActive"
            )
            .populate(
                "offeredServices",
                "name slug description"
            );

    res.status(200).json({
        message:
            "Provider services updated successfully.",
        profile: updatedProfile
    });
}


async function getProviderProfiles(req, res) {
    const profiles = await ProviderProfile.find()
        .populate("user", "name")
        .populate(
            "offeredServices",
            "name slug description"
        );

    const profilesWithCompletedJobs = await Promise.all(
        profiles.map(async (profile) => {
            const profileData = profile.toObject();

            profileData.completedJobs = await Booking.countDocuments({
                provider: profile.user._id,
                status: "completed"
            });

            return profileData;
        })
    );

    res.status(200).json(profilesWithCompletedJobs);
}


module.exports = {
    getMyProviderProfile,
    updateMyProviderProfile,
    getProviderProfiles,
    getProviderProfilesForAdmin,
    updateProviderServicesByAdmin
};