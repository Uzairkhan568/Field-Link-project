const notificationService = require("../services/notificationService");

async function getNotifications(req, res) {
    const notifications =
        await notificationService.getNotificationsForUser(req.user.id);

    res.status(200).json(notifications);
}

async function getUnreadCount(req, res) {
    const count =
        await notificationService.getUnreadNotificationCount(req.user.id);

    res.status(200).json({
        count,
    });
}

async function markNotificationAsRead(req, res) {
    const notification =
        await notificationService.markNotificationAsRead(
            req.params.id,
            req.user.id
        );

    res.status(200).json({
        message: "Notification marked as read.",
        notification,
    });
}

async function markAllNotificationsAsRead(req, res) {
    await notificationService.markAllNotificationsAsRead(req.user.id);

    res.status(200).json({
        message: "All notifications marked as read.",
    });
}

module.exports = {
    getNotifications,
    getUnreadCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
};