const express = require("express");

const router = express.Router();

router.post("/", (req, res) => {
    const { name, service, date, time } = req.body;

    if (!name || !service || !date || !time) {
        return res.status(400).json({
            message: "All booking fields are required",
        });
    }

    // Combine the selected date and time into one Date object
    const bookingDateTime = new Date(`${date}T${time}`);

    // Make sure the date/time format is valid
    if (isNaN(bookingDateTime.getTime())) {
        return res.status(400).json({
            message: "Invalid booking date or time",
        });
    }

    const now = new Date();

    // Require at least 1 hour of advance notice
    const minimumBookingTime = new Date(
        now.getTime() + 60 * 60 * 1000
    );

    if (bookingDateTime < minimumBookingTime) {
        return res.status(400).json({
            message: "Bookings must be made at least 1 hour in advance",
        });
    }

    console.log("New booking received:");
    console.log("Name:", name);
    console.log("Service:", service);
    console.log("Date:", date);
    console.log("Time:", time);

    res.json({
        message: "Booking request received",
        booking: {
            name,
            service,
            date,
            time,
        },
    });
});

module.exports = router;