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

        bio: {
            type: String,
            trim: true,
            maxlength: 1000,
            default: "",
        },

        averageRating: {
            type: Number,
            min: 0,
            max: 5,
            default: 0,
        },

        totalReviews: {
            type: Number,
            min: 0,
            default: 0,
        },

        completedJobs: {
            type: Number,
            min: 0,
            default: 0,
        },
    },

    { timestamps: true }
);

module.exports = mongoose.model("ProviderProfile", providerProfileSchema);