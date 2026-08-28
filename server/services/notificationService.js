const Notification = require("../models/Notification");

async function createNotification({
    userId,
    type,
    message,
    bookingId = null,
}) {
    return Notification.create({
        user: userId,
        type,
        message,
        booking: bookingId,
    });
}

async function getNotificationsForUser(userId) {
    return Notification.find({ user: userId })
        .populate("booking", "status scheduledAt")
        .sort({ createdAt: -1 });
}

async function markNotificationAsRead(notificationId, userId) {
    const notification = await Notification.findOneAndUpdate(
        {
            _id: notificationId,
            user: userId,
        },
        {
            read: true,
        },
        {
            new: true,
        }
    );

    if (!notification) {
        const error = new Error("Notification not found.");
        error.statusCode = 404;
        throw error;
    }

    return notification;
}

async function markAllNotificationsAsRead(userId) {
    await Notification.updateMany(
        {
            user: userId,
            read: false,
        },
        {
            read: true,
        }
    );
}

async function getUnreadNotificationCount(userId) {
    return Notification.countDocuments({
        user: userId,
        read: false,
    });
}

module.exports = {
    createNotification,
    getNotificationsForUser,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    getUnreadNotificationCount,
};