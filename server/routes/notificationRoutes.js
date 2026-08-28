const express = require("express");

const requireAuth = require("../middleware/requireAuth");

const {
    getNotifications,
    getUnreadCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
} = require("../controllers/notificationController");

const router = express.Router();

router.get("/", requireAuth, getNotifications);

router.get("/unread-count", requireAuth, getUnreadCount);

router.patch(
    "/:id/read",
    requireAuth,
    markNotificationAsRead
);

router.patch(
    "/read-all",
    requireAuth,
    markAllNotificationsAsRead
);

module.exports = router;