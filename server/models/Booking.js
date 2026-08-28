const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
    {
        customer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        provider: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
            index: true,
        },
        service: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Service",
            required: true,
        },
        scheduledAt: {
            type: Date,
            required: true,
        },
        timezone: {
            type: String,
            required: true,
            trim: true,
        },
        address: {
            addressLine: { type: String },
            city: { type: String },
            state: { type: String },
            postalCode: { type: String }
        },
        status: {
            type: String,
            enum: ["pending", "confirmed", "cancelled", "completed"],
            default: "pending",
        },
        notes: {
            type: String,
            trim: true,
            maxlength: 1000,
        },
    },
    { timestamps: true }
);

bookingSchema.index({ customer: 1, scheduledAt: -1 });
bookingSchema.index({ provider: 1, scheduledAt: 1 });
bookingSchema.index({ status: 1, scheduledAt: 1 });

module.exports = mongoose.model("Booking", bookingSchema);
