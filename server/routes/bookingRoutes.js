const express = require("express");
const requireAuth = require("../middleware/requireAuth");
const requireRole = require("../middleware/requireRole");
const {
    createBooking,
    getBookings,
    getAvailableBookings,
    acceptBooking,
    completeBooking,
    cancelBooking
} = require("../controllers/bookingController");

const router = express.Router();

router.post("/", requireAuth, createBooking);
router.get("/", requireAuth, getBookings);
router.get("/available", requireAuth, requireRole("provider"), getAvailableBookings);
router.patch("/:id/accept", requireAuth, requireRole("provider"), acceptBooking);
router.patch("/:id/complete", requireAuth, requireRole("provider"), completeBooking);
router.patch("/:id/cancel", requireAuth, cancelBooking);

module.exports = router;