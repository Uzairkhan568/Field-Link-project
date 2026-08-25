const express = require("express");
const requireAuth = require("../middleware/requireAuth");
const { createBooking } = require("../controllers/bookingController");

const router = express.Router();

router.post("/", requireAuth, createBooking);

module.exports = router;