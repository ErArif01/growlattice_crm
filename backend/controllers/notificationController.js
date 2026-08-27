const Notification = require("../models/Notification");

// GET /api/notifications - most recent first, used by the bell icon dropdown.
// Includes both read and unread; the frontend separates them visually.
async function getNotifications(req, res) {
  try {
    const notifications = await Notification.find()
      .populate("customer", "name phone")
      .sort({ createdAt: -1 })
      .limit(50);
    const unreadCount = await Notification.countDocuments({ isRead: false });
    res.json({ notifications, unreadCount });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch notifications", error: error.message });
  }
}

// PATCH /api/notifications/:id/read
async function markNotificationRead(req, res) {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );
    if (!notification) return res.status(404).json({ message: "Notification not found" });
    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: "Failed to update notification", error: error.message });
  }
}

// PATCH /api/notifications/read-all
async function markAllRead(req, res) {
  try {
    await Notification.updateMany({ isRead: false }, { isRead: true });
    res.json({ message: "All notifications marked as read" });
  } catch (error) {
    res.status(500).json({ message: "Failed to update notifications", error: error.message });
  }
}

module.exports = { getNotifications, markNotificationRead, markAllRead };
