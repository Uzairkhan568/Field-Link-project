const Booking = require("../models/Booking");
const Service = require("../models/Service");
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

module.exports = { createBooking };
