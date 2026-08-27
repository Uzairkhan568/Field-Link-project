const mongoose = require("mongoose");

const providerProfileSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
        },
        offeredServices: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Service",
            },
        ],
        // Future extensions:
        // availability: { ... },
        // serviceArea: { ... },
        // verificationStatus: { ... },
        // ratings: { ... }
    },
    { timestamps: true }
);

module.exports = mongoose.model("ProviderProfile", providerProfileSchema);
