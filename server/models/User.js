const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema(
    {
        label: {
            type: String,
            required: true,
            trim: true,
            maxlength: 50,
        },

        addressLine: {
            type: String,
            required: true,
            trim: true,
            maxlength: 200,
        },

        city: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100,
        },

        state: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100,
        },

        postalCode: {
            type: String,
            required: true,
            trim: true,
            maxlength: 20,
        },

        isDefault: {
            type: Boolean,
            default: false,
        },
    },
    {
        _id: true,
    }
);

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100,
        },

        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
            unique: true,
            match: /^\S+@\S+\.\S+$/,
        },

        passwordHash: {
            type: String,
            required: true,
        },

        role: {
            type: String,
            enum: ["customer", "provider", "admin"],
            default: "customer",
        },

        isActive: {
            type: Boolean,
            default: true,
        },

        addresses: {
            type: [addressSchema],
            default: [],
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("User", userSchema);
