const User = require("../models/User");
const ProviderProfile = require("../models/ProviderProfile");
const Service = require("../models/Service");

async function getUsers(req, res) {
    const users = await User.find().select("-passwordHash");
    res.status(200).json(users);
}

async function updateUserRole(req, res) {
    const { role } = req.body;

    if (!["customer", "provider", "admin"].includes(role)) {
        const err = new Error("Invalid role");
        err.statusCode = 400;
        throw err;
    }

    const user = await User.findById(req.params.id);
    if (!user) {
        const err = new Error("User not found");
        err.statusCode = 404;
        throw err;
    }

    user.role = role;
    await user.save();

    if (role === "provider") {
        await ProviderProfile.updateOne(
            { user: user._id },
            { $setOnInsert: { user: user._id, offeredServices: [] } },
            { upsert: true }
        );
    }

    const safeUser = user.toObject();
    delete safeUser.passwordHash;

    res.status(200).json({
        message: "Role updated",
        user: safeUser
    });
}

async function updateProviderServices(req, res) {
    const { offeredServices } = req.body;

    if (!Array.isArray(offeredServices)) {
        const err = new Error("offeredServices must be an array.");
        err.statusCode = 400;
        throw err;
    }

    const user = await User.findById(req.params.id);
    if (!user) {
        const err = new Error("User not found.");
        err.statusCode = 404;
        throw err;
    }

    if (user.role !== "provider") {
        const err = new Error("Only providers can have offered services.");
        err.statusCode = 400;
        throw err;
    }

    const services = await Service.find({
        _id: { $in: offeredServices },
        isActive: true
    }).select("_id");

    if (services.length !== offeredServices.length) {
        const err = new Error("One or more services are invalid or inactive.");
        err.statusCode = 400;
        throw err;
    }

    const profile = await ProviderProfile.findOneAndUpdate(
        { user: user._id },
        { offeredServices },
        { new: true, upsert: true }
    );

    res.status(200).json({
        message: "Services updated",
        profile
    });
}

module.exports = {
    getUsers,
    updateUserRole,
    updateProviderServices
};