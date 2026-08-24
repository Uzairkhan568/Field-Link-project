const express = require("express");

const router = express.Router();

router.post("/", (req, res) => {
    const { name, service, date, time } = req.body;

    if (!name || !service || !date || !time) {
        return res.status(400).json({
            message: "All booking fields are required",
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