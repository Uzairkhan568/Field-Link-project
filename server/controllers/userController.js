const User = require("../models/User");
const ProviderProfile = require("../models/ProviderProfile");
const Service = require("../models/Service");

function normalizeEmail(email) {
    return String(email || "").trim().toLowerCase();
}

/*
 * Get the currently logged-in user's profile
 */
async function getMyProfile(req, res) {
    const user = await User.findById(req.user.id).select("-passwordHash");

    if (!user) {
        const err = new Error("User not found.");
        err.statusCode = 404;
        throw err;
    }

    res.status(200).json({
        user,
    });
}

/*
 * Update the currently logged-in user's basic profile
 */
async function updateMyProfile(req, res) {
    const { name, email } = req.body;

    if (name !== undefined) {
        const trimmedName = String(name).trim();

        if (!trimmedName || trimmedName.length > 100) {
            const err = new Error(
                "Name must be between 1 and 100 characters."
            );
            err.statusCode = 400;
            throw err;
        }
    }

    let normalizedEmail;

    if (email !== undefined) {
        normalizedEmail = normalizeEmail(email);

        if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
            const err = new Error(
                "A valid email address is required."
            );
            err.statusCode = 400;
            throw err;
        }

        const existingUser = await User.findOne({
            email: normalizedEmail,
            _id: { $ne: req.user.id },
        });

        if (existingUser) {
            const err = new Error(
                "An account with this email already exists."
            );
            err.statusCode = 409;
            throw err;
        }
    }

    const user = await User.findById(req.user.id);

    if (!user) {
        const err = new Error("User not found.");
        err.statusCode = 404;
        throw err;
    }

    if (name !== undefined) {
        user.name = String(name).trim();
    }

    if (email !== undefined) {
        user.email = normalizedEmail;
    }

    await user.save();

    const safeUser = user.toObject();
    delete safeUser.passwordHash;

    res.status(200).json({
        message: "Profile updated successfully.",
        user: safeUser,
    });
}

/*
 * Add a new saved address
 */
async function addAddress(req, res) {
    const {
        label,
        addressLine,
        city,
        state,
        postalCode,
    } = req.body;

    validateAddressFields({
        label,
        addressLine,
        city,
        state,
        postalCode,
    });

    const user = await User.findById(req.user.id);

    if (!user) {
        const err = new Error("User not found.");
        err.statusCode = 404;
        throw err;
    }

    const shouldBeDefault =
        user.addresses.length === 0;

    if (shouldBeDefault) {
        user.addresses.push({
            label: String(label).trim(),
            addressLine: String(addressLine).trim(),
            city: String(city).trim(),
            state: String(state).trim(),
            postalCode: String(postalCode).trim(),
            isDefault: true,
        });
    } else {
        user.addresses.push({
            label: String(label).trim(),
            addressLine: String(addressLine).trim(),
            city: String(city).trim(),
            state: String(state).trim(),
            postalCode: String(postalCode).trim(),
            isDefault: false,
        });
    }

    await user.save();

    const addedAddress =
        user.addresses[user.addresses.length - 1];

    res.status(201).json({
        message: "Address added successfully.",
        address: addedAddress,
    });
}

/*
 * Update an existing saved address
 */
async function updateAddress(req, res) {
    const {
        label,
        addressLine,
        city,
        state,
        postalCode,
    } = req.body;

    validateAddressFields({
        label,
        addressLine,
        city,
        state,
        postalCode,
    });

    const user = await User.findById(req.user.id);

    if (!user) {
        const err = new Error("User not found.");
        err.statusCode = 404;
        throw err;
    }

    const address = user.addresses.id(req.params.addressId);

    if (!address) {
        const err = new Error("Address not found.");
        err.statusCode = 404;
        throw err;
    }

    address.label = String(label).trim();
    address.addressLine = String(addressLine).trim();
    address.city = String(city).trim();
    address.state = String(state).trim();
    address.postalCode = String(postalCode).trim();

    await user.save();

    res.status(200).json({
        message: "Address updated successfully.",
        address,
    });
}

/*
 * Delete a saved address
 */
async function deleteAddress(req, res) {
    const user = await User.findById(req.user.id);

    if (!user) {
        const err = new Error("User not found.");
        err.statusCode = 404;
        throw err;
    }

    const address = user.addresses.id(req.params.addressId);

    if (!address) {
        const err = new Error("Address not found.");
        err.statusCode = 404;
        throw err;
    }

    const wasDefault = address.isDefault;

    address.deleteOne();

    /*
     * If the deleted address was the default,
     * automatically make another address default.
     */
    if (wasDefault && user.addresses.length > 0) {
        user.addresses[0].isDefault = true;
    }

    await user.save();

    res.status(200).json({
        message: "Address deleted successfully.",
    });
}

/*
 * Set an address as the default address
 */
async function setDefaultAddress(req, res) {
    const user = await User.findById(req.user.id);

    if (!user) {
        const err = new Error("User not found.");
        err.statusCode = 404;
        throw err;
    }

    const address = user.addresses.id(req.params.addressId);

    if (!address) {
        const err = new Error("Address not found.");
        err.statusCode = 404;
        throw err;
    }

    user.addresses.forEach((savedAddress) => {
        savedAddress.isDefault = false;
    });

    address.isDefault = true;

    await user.save();

    res.status(200).json({
        message: "Default address updated successfully.",
        address,
    });
}

/*
 * Validate address data
 */
function validateAddressFields({
    label,
    addressLine,
    city,
    state,
    postalCode,
}) {
    if (
        !label ||
        !String(label).trim() ||
        !addressLine ||
        !String(addressLine).trim() ||
        !city ||
        !String(city).trim() ||
        !state ||
        !String(state).trim() ||
        !postalCode ||
        !String(postalCode).trim()
    ) {
        const err = new Error(
            "Label, address, city, state, and postal code are required."
        );
        err.statusCode = 400;
        throw err;
    }

    if (String(label).trim().length > 50) {
        const err = new Error(
            "Address label must be 50 characters or fewer."
        );
        err.statusCode = 400;
        throw err;
    }

    if (String(addressLine).trim().length > 200) {
        const err = new Error(
            "Address must be 200 characters or fewer."
        );
        err.statusCode = 400;
        throw err;
    }

    if (String(city).trim().length > 100) {
        const err = new Error(
            "City must be 100 characters or fewer."
        );
        err.statusCode = 400;
        throw err;
    }

    if (String(state).trim().length > 100) {
        const err = new Error(
            "State must be 100 characters or fewer."
        );
        err.statusCode = 400;
        throw err;
    }

    if (String(postalCode).trim().length > 20) {
        const err = new Error(
            "Postal code must be 20 characters or fewer."
        );
        err.statusCode = 400;
        throw err;
    }
}

/*
 * Admin: get all users
 */
async function getUsers(req, res) {
    const users = await User.find().select("-passwordHash");

    res.status(200).json(users);
}

/*
 * Admin: update user role
 */
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
            {
                $setOnInsert: {
                    user: user._id,
                    offeredServices: [],
                },
            },
            {
                upsert: true,
            }
        );
    }

    const safeUser = user.toObject();
    delete safeUser.passwordHash;

    res.status(200).json({
        message: "Role updated",
        user: safeUser,
    });
}

/*
 * Admin: update provider services
 */
async function updateProviderServices(req, res) {
    const { offeredServices } = req.body;

    if (!Array.isArray(offeredServices)) {
        const err = new Error(
            "offeredServices must be an array."
        );
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
        const err = new Error(
            "Only providers can have offered services."
        );
        err.statusCode = 400;
        throw err;
    }

    const services = await Service.find({
        _id: { $in: offeredServices },
        isActive: true,
    }).select("_id");

    if (services.length !== offeredServices.length) {
        const err = new Error(
            "One or more services are invalid or inactive."
        );
        err.statusCode = 400;
        throw err;
    }

    const profile = await ProviderProfile.findOneAndUpdate(
        { user: user._id },
        { offeredServices },
        {
            new: true,
            upsert: true,
        }
    );

    res.status(200).json({
        message: "Services updated",
        profile,
    });
}

module.exports = {
    getUsers,
    updateUserRole,
    updateProviderServices,
    getMyProfile,
    updateMyProfile,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
};