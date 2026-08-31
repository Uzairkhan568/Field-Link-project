const express = require("express");

const requireAuth = require("../middleware/requireAuth");
const requireRole = require("../middleware/requireRole");

const {
    getUsers,
    updateUserRole,
    updateProviderServices,
    getMyProfile,
    updateMyProfile,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
} = require("../controllers/userController");

const router = express.Router();

/*
 * Current user's profile
 */
router.get("/me", requireAuth, getMyProfile);

router.patch("/me", requireAuth, updateMyProfile);

/*
 * Current customer's saved addresses
 */
router.post(
    "/me/addresses",
    requireAuth,
    requireRole("customer"),
    addAddress
);

router.patch(
    "/me/addresses/:addressId",
    requireAuth,
    requireRole("customer"),
    updateAddress
);

router.delete(
    "/me/addresses/:addressId",
    requireAuth,
    requireRole("customer"),
    deleteAddress
);

router.patch(
    "/me/addresses/:addressId/default",
    requireAuth,
    requireRole("customer"),
    setDefaultAddress
);

/*
 * Admin user management
 */
router.get(
    "/",
    requireAuth,
    requireRole("admin"),
    getUsers
);

router.patch(
    "/:id/role",
    requireAuth,
    requireRole("admin"),
    updateUserRole
);

router.patch(
    "/:id/services",
    requireAuth,
    requireRole("admin"),
    updateProviderServices
);

module.exports = router;
