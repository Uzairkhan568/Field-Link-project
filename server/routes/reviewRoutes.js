const express = require("express");

const requireAuth = require("../middleware/requireAuth");
const requireRole = require("../middleware/requireRole");

const {
    createReview,
    getReviewForBooking
} = require("../controllers/reviewController");

const router = express.Router();

router.get(
    "/booking/:bookingId",
    requireAuth,
    requireRole("customer"),
    getReviewForBooking
);

router.post(
    "/",
    requireAuth,
    requireRole("customer"),
    createReview
);

module.exports = router;