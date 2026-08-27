const express = require("express");
const requireAuth = require("../middleware/requireAuth");
const requireRole = require("../middleware/requireRole");
const { getUsers, updateUserRole, updateProviderServices } = require("../controllers/userController");

const router = express.Router();

router.get("/", requireAuth, requireRole("admin"), getUsers);
router.patch("/:id/role", requireAuth, requireRole("admin"), updateUserRole);
router.patch("/:id/services", requireAuth, requireRole("admin"), updateProviderServices);

module.exports = router;
