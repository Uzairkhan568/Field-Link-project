const express = require("express");

const requireAuth = require("../middleware/requireAuth");
const requireRole = require("../middleware/requireRole");

const {
    getMyProviderProfile,
    updateMyProviderProfile,
    getProviderProfiles,
    getProviderProfilesForAdmin,
    updateProviderServicesByAdmin
} = require("../controllers/providerProfileController");

const router = express.Router();


/*
 * PROVIDER
 * View own profile
 */
router.get(
    "/me",
    requireAuth,
    requireRole("provider"),
    getMyProviderProfile
);


/*
 * PROVIDER
 * Edit own profile
 */
router.patch(
    "/me",
    requireAuth,
    requireRole("provider"),
    updateMyProviderProfile
);


/*
 * ADMIN
 * View all provider profiles
 */
router.get(
    "/admin",
    requireAuth,
    requireRole("admin"),
    getProviderProfilesForAdmin
);


/*
 * ADMIN
 * Edit services offered by a provider
 */
router.patch(
    "/admin/:providerId",
    requireAuth,
    requireRole("admin"),
    updateProviderServicesByAdmin
);


/*
 * CUSTOMER
 * View provider profiles
 */
router.get(
    "/",
    requireAuth,
    requireRole("customer"),
    getProviderProfiles
);


module.exports = router;