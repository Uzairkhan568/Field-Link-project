const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        type: {
            type: String,
            enum: [
                "booking_created",
                "booking_accepted",
                "booking_completed",
                "booking_cancelled",
                "payment_success",
            ],
            required: true,
        },

        message: {
            type: String,
            required: true,
            trim: true,
        },

        booking: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Booking",
            default: null,
        },

        read: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

notificationSchema.index({ user: 1, read: 1, createdAt: -1 });

module.exports = mongoose.model("Notification", notificationSchema);