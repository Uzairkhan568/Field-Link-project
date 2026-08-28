const express = require("express");

const requireAuth = require("../middleware/requireAuth");
const requireRole = require("../middleware/requireRole");

const { processSandboxPayment } = require("../controllers/paymentController");

const router = express.Router();

router.post(
    "/sandbox",
    requireAuth,
    requireRole("customer"),
    processSandboxPayment
);

module.exports = router;