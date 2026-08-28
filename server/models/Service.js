const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            unique: true,
        },
        slug: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
            unique: true,
            match: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        },
        description: {
            type: String,
            required: true,
            trim: true,
            maxlength: 500,
        },
        imageUrl: {
            type: String,
            trim: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Service", serviceSchema);
