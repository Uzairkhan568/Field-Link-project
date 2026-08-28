const Booking = require("../models/Booking");
const Service = require("../models/Service");
const ProviderProfile = require("../models/ProviderProfile");
const notificationService = require("./notificationService");
const { validateAppointmentTime } = require("../utils/appointmentValidation");

async function createBooking({
    customerId,
    serviceId,
    scheduledAt,
    timezone,
    address
}) {
    const service = await Service.findById(serviceId);

    if (!service || !service.isActive) {
        const error = new Error("Service not found or inactive.");
        error.statusCode = 404;
        throw error;
    }

    validateAppointmentTime(scheduledAt, timezone);

    const booking = new Booking({
        customer: customerId,
        service: serviceId,
        scheduledAt,
        timezone,
        address,
        status: "pending"
    });

    await booking.save();

    return booking;
}

async function getBookingsForCustomer(customerId) {
    return Booking.find({ customer: customerId })
        .populate("service", "name")
        .sort({ scheduledAt: -1 });
}

async function getBookingsForProvider(providerId) {
    return Booking.find({ provider: providerId })
        .populate("service", "name customer")
        .sort({ scheduledAt: 1 });
}

async function getAllBookings() {
    return Booking.find()
        .populate("service", "name")
        .populate("customer", "name email")
        .populate("provider", "name email")
        .sort({ scheduledAt: -1 });
}

async function getAvailableBookings(providerId) {
    const profile = await ProviderProfile.findOne({ user: providerId });

    if (!profile) return [];

    return Booking.find({
        status: "pending",
        service: { $in: profile.offeredServices },
        scheduledAt: { $gte: new Date() }
    })
        .populate("service", "name")
        .populate("customer", "name")
        .sort({ scheduledAt: 1 });
}

async function acceptBooking(bookingId, providerId) {
    const booking = await Booking.findOne({
        _id: bookingId,
        status: "pending"
    });

    if (!booking) {
        const err = new Error("Booking not available.");
        err.statusCode = 400;
        throw err;
    }

    const profile = await ProviderProfile.findOne({
        user: providerId
    });

    if (
        !profile ||
        !profile.offeredServices.some(
            (serviceId) =>
                serviceId.toString() === booking.service.toString()
        )
    ) {
        const err = new Error(
            "You are not authorized to provide this service."
        );
        err.statusCode = 403;
        throw err;
    }

    const conflict = await Booking.findOne({
        provider: providerId,
        status: "confirmed",
        scheduledAt: booking.scheduledAt
    });

    if (conflict) {
        const err = new Error(
            "You already have a confirmed booking at this exact time."
        );
        err.statusCode = 409;
        throw err;
    }

    const acceptedBooking = await Booking.findOneAndUpdate(
        {
            _id: bookingId,
            status: "pending"
        },
        {
            $set: {
                provider: providerId,
                status: "confirmed"
            }
        },
        {
            new: true
        }
    );

    if (!acceptedBooking) {
        const err = new Error(
            "Booking was already accepted by another provider."
        );
        err.statusCode = 409;
        throw err;
    }

    await notificationService.createNotification({
        userId: acceptedBooking.customer,
        type: "booking_accepted",
        message: "Your booking has been accepted by a provider.",
        bookingId: acceptedBooking._id
    });

    return acceptedBooking;
}

async function completeBooking(bookingId, providerId) {
    const booking = await Booking.findById(bookingId);

    if (
        !booking ||
        booking.provider?.toString() !== providerId ||
        booking.status !== "confirmed"
    ) {
        const err = new Error(
            "Invalid booking or not authorized."
        );
        err.statusCode = 400;
        throw err;
    }

    booking.status = "completed";

    await booking.save();

    await notificationService.createNotification({
        userId: booking.customer,
        type: "booking_completed",
        message: "Your booking has been completed.",
        bookingId: booking._id
    });

    return booking;
}

async function cancelBooking(bookingId, userId, role) {
    const booking = await Booking.findById(bookingId);

    if (!booking) {
        const err = new Error("Booking not found.");
        err.statusCode = 404;
        throw err;
    }

    if (role === "customer") {
        if (booking.customer.toString() !== userId) {
            const err = new Error("Not authorized.");
            err.statusCode = 403;
            throw err;
        }

        if (!["pending", "confirmed"].includes(booking.status)) {
            const err = new Error(
                "This booking cannot be cancelled."
            );
            err.statusCode = 400;
            throw err;
        }

        booking.status = "cancelled";

        await booking.save();

        if (booking.provider) {
            await notificationService.createNotification({
                userId: booking.provider,
                type: "booking_cancelled",
                message: "A customer cancelled their booking.",
                bookingId: booking._id
            });
        }

        return booking;
    }

    if (role === "provider") {
        if (booking.provider?.toString() !== userId) {
            const err = new Error("Not authorized.");
            err.statusCode = 403;
            throw err;
        }

        if (booking.status !== "confirmed") {
            const err = new Error(
                "Only confirmed bookings can be cancelled by a provider."
            );
            err.statusCode = 400;
            throw err;
        }

        booking.status = "pending";
        booking.provider = null;

        await booking.save();

        await notificationService.createNotification({
            userId: booking.customer,
            type: "booking_cancelled",
            message: "Your provider cancelled the booking. It is available for another provider.",
            bookingId: booking._id
        });

        return booking;
    }

    if (role === "admin") {
        booking.status = "cancelled";

        await booking.save();

        if (booking.customer) {
            await notificationService.createNotification({
                userId: booking.customer,
                type: "booking_cancelled",
                message: "Your booking was cancelled by an administrator.",
                bookingId: booking._id
            });
        }

        if (booking.provider) {
            await notificationService.createNotification({
                userId: booking.provider,
                type: "booking_cancelled",
                message: "A booking assigned to you was cancelled by an administrator.",
                bookingId: booking._id
            });
        }

        return booking;
    }

    const err = new Error("Invalid user role.");
    err.statusCode = 400;
    throw err;
}

module.exports = {
    createBooking,
    getBookingsForCustomer,
    getBookingsForProvider,
    getAllBookings,
    getAvailableBookings,
    acceptBooking,
    completeBooking,
    cancelBooking
};
