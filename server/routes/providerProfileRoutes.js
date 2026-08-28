const express = require("express");

const requireAuth = require("../middleware/requireAuth");
const requireRole = require("../middleware/requireRole");

const {
    getMyProviderProfile,
    updateMyProviderProfile,
    getProviderProfiles
} = require("../controllers/providerProfileController");

const router = express.Router();

router.get(
    "/me",
    requireAuth,
    requireRole("provider"),
    getMyProviderProfile
);

router.patch(
    "/me",
    requireAuth,
    requireRole("provider"),
    updateMyProviderProfile
);

router.get(
    "/",
    requireAuth,
    requireRole("customer"),
    getProviderProfiles
);

module.exports = router;