const z = require("zod");
const Booking = require("../models/Booking");

const paymentSchema = z.object({
    bookingId: z.string().regex(/^[0-9a-fA-F]{24}$/, {
        message: "Invalid booking ID format.",
    }),
    result: z.enum(["success", "failure"]),
});

async function processSandboxPayment(req, res) {
    const parseResult = paymentSchema.safeParse(req.body);

    if (!parseResult.success) {
        const error = new Error(parseResult.error.issues[0].message);
        error.statusCode = 400;
        throw error;
    }

    const { bookingId, result } = parseResult.data;

    const booking = await Booking.findById(bookingId);

    if (!booking) {
        const error = new Error("Booking not found.");
        error.statusCode = 404;
        throw error;
    }

    // Only the customer who created the booking can pay for it.
    if (booking.customer.toString() !== req.user.id) {
        const error = new Error(
            "You are not authorized to pay for this booking."
        );
        error.statusCode = 403;
        throw error;
    }

    // Cancelled bookings cannot be paid.
    if (booking.status === "cancelled") {
        const error = new Error(
            "Cancelled bookings cannot be paid."
        );
        error.statusCode = 400;
        throw error;
    }

    // Prevent paying the same booking twice.
    if (booking.paymentStatus === "paid") {
        const error = new Error(
            "This booking has already been paid."
        );
        error.statusCode = 409;
        throw error;
    }

    if (result === "success") {
        booking.paymentStatus = "paid";
    } else {
        booking.paymentStatus = "failed";
    }

    await booking.save();

    res.status(200).json({
        message:
            result === "success"
                ? "Sandbox payment successful."
                : "Sandbox payment failed.",
        booking: {
            id: booking._id.toString(),
            paymentStatus: booking.paymentStatus,
        },
    });
}

module.exports = {
    processSandboxPayment,
};