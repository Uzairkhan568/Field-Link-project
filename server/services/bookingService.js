const Booking = require("../models/Booking");
const Service = require("../models/Service");
const ProviderProfile = require("../models/ProviderProfile");
const { validateAppointmentTime } = require("../utils/appointmentValidation");

async function createBooking({ customerId, serviceId, scheduledAt, timezone }) {
    // Check if service exists and is active
    const service = await Service.findById(serviceId);
    if (!service || !service.isActive) {
        const error = new Error("Service not found or inactive.");
        error.statusCode = 404;
        throw error;
    }

    // Validate appointment time
    validateAppointmentTime(scheduledAt, timezone);

    // Create booking
    const booking = new Booking({
        customer: customerId,
        service: serviceId,
        scheduledAt,
        timezone,
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
        .populate("service", "name customer") // Need customer details maybe?
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
    const booking = await Booking.findById(bookingId);
    if (!booking || booking.status !== "pending") {
        const err = new Error("Booking not available.");
        err.statusCode = 400;
        throw err;
    }

    const profile = await ProviderProfile.findOne({ user: providerId });
    if (!profile || !profile.offeredServices.includes(booking.service.toString())) {
        const err = new Error("You are not authorized to provide this service.");
        err.statusCode = 403;
        throw err;
    }

    const conflict = await Booking.findOne({
        provider: providerId,
        status: "confirmed",
        scheduledAt: booking.scheduledAt
    });
    if (conflict) {
        const err = new Error("You already have a confirmed booking at this exact time.");
        err.statusCode = 409;
        throw err;
    }

    booking.provider = providerId;
    booking.status = "confirmed";
    await booking.save();
    return booking;
}

async function completeBooking(bookingId, providerId) {
    const booking = await Booking.findById(bookingId);
    if (!booking || booking.provider?.toString() !== providerId || booking.status !== "confirmed") {
        const err = new Error("Invalid booking or not authorized.");
        err.statusCode = 400;
        throw err;
    }
    booking.status = "completed";
    await booking.save();
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
        booking.status = "cancelled";
    } else if (role === "provider") {
        if (booking.provider?.toString() !== userId) {
            const err = new Error("Not authorized.");
            err.statusCode = 403;
            throw err;
        }
        // Provider drops the job, returns to marketplace
        booking.status = "pending";
        booking.provider = null;
    } else if (role === "admin") {
        booking.status = "cancelled";
    }

    await booking.save();
    return booking;
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
