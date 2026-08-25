const z = require("zod");
const mongoose = require("mongoose");
const bookingService = require("../services/bookingService");

const createBookingSchema = z.object({
    serviceId: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
        message: "Invalid service ID format",
    }),
    scheduledAt: z.string().datetime({ offset: true }), // validates ISO 8601
    timezone: z.string().refine((val) => {
        try {
            Intl.DateTimeFormat(undefined, { timeZone: val });
            return true;
        } catch (e) {
            return false;
        }
    }, { message: "Invalid IANA timezone" }),
});

async function createBooking(req, res) {
    const parseResult = createBookingSchema.safeParse(req.body);
    
    if (!parseResult.success) {
        const error = new Error(parseResult.error.errors[0].message);
        error.statusCode = 400;
        throw error;
    }

    const { serviceId, scheduledAt, timezone } = parseResult.data;
    const customerId = req.user.id;

    const booking = await bookingService.createBooking({
        customerId,
        serviceId,
        scheduledAt,
        timezone
    });

    res.status(201).json({
        message: "Booking request received",
        booking: {
            id: booking._id.toString(),
            serviceId: booking.service.toString(),
            scheduledAt: booking.scheduledAt,
            timezone: booking.timezone,
            status: booking.status
        }
    });
}

module.exports = { createBooking };
