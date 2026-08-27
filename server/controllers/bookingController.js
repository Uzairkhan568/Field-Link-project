const z = require("zod");
const bookingService = require("../services/bookingService");

const createBookingSchema = z.object({
    serviceId: z.string().regex(/^[0-9a-fA-F]{24}$/, {
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
        const error = new Error(parseResult.error.issues[0].message);
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

async function getBookings(req, res) {
    const { role, id } = req.user;
    let bookings;

    if (role === 'admin') {
        bookings = await bookingService.getAllBookings();
    } else if (role === 'provider') {
        bookings = await bookingService.getBookingsForProvider(id);
    } else {
        bookings = await bookingService.getBookingsForCustomer(id);
    }

    res.status(200).json(
        bookings.map((booking) => ({
            id: booking._id.toString(),
            service: booking.service,
            scheduledAt: booking.scheduledAt,
            timezone: booking.timezone,
            status: booking.status,
            customer: booking.customer, // Only populated for provider/admin
            provider: booking.provider, // Only populated for admin
        }))
    );
}

async function getAvailableBookings(req, res) {
    const bookings = await bookingService.getAvailableBookings(req.user.id);
    res.status(200).json(
        bookings.map((booking) => ({
            id: booking._id.toString(),
            service: booking.service,
            scheduledAt: booking.scheduledAt,
            timezone: booking.timezone,
            status: booking.status,
            customer: booking.customer,
        }))
    );
}

async function acceptBooking(req, res) {
    const booking = await bookingService.acceptBooking(req.params.id, req.user.id);
    res.status(200).json({ message: "Booking accepted", booking });
}

async function completeBooking(req, res) {
    const booking = await bookingService.completeBooking(req.params.id, req.user.id);
    res.status(200).json({ message: "Booking completed", booking });
}

async function cancelBooking(req, res) {
    const booking = await bookingService.cancelBooking(req.params.id, req.user.id, req.user.role);
    res.status(200).json({ message: "Booking cancelled", booking });
}

module.exports = {
    createBooking,
    getBookings,
    getAvailableBookings,
    acceptBooking,
    completeBooking,
    cancelBooking
};
