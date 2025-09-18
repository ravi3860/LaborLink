const Notification = require("../models/Notifications");

// Utility function: Add a notification
const addNotification = async (userId, role, message, type = "info", link = "") => {
  try {
    const notif = new Notification({ userId, role, message, type, link });
    await notif.save();
    return notif;
  } catch (err) {
    console.error("Error adding notification:", err);
    throw err;
  }
};


// Route handler: Create notification via API
const createNotification = async (req, res) => {
  try {
    const { message, type } = req.body;
    const userId = req.user.id;
    const role = req.user.role;

    if (!message) return res.status(400).json({ error: "Message is required" });

    const notif = await addNotification(userId, role, message, type);
    res.status(201).json({ message: "Notification added", notification: notif });
  } catch (err) {
    console.error("Error creating notification:", err);
    res.status(500).json({ error: "Failed to add notification" });
  }
};

// Get notifications for logged-in user
const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(50);
    res.status(200).json({ notifications });
  } catch (err) {
    console.error("Error fetching notifications:", err);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
};

// Mark notification as read
const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { read: true },
      { new: true }
    );
    if (!notification) return res.status(404).json({ error: "Notification not found" });
    res.status(200).json({ message: "Notification marked as read", notification });
  } catch (err) {
    console.error("Error marking notification as read:", err);
    res.status(500).json({ error: "Failed to update notification" });
  }
};

// Delete notification
const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const deleted = await Notification.findByIdAndDelete(notificationId);
    if (!deleted) return res.status(404).json({ error: "Notification not found" });
    res.status(200).json({ message: "Notification deleted successfully" });
  } catch (err) {
    console.error("Error deleting notification:", err);
    res.status(500).json({ error: "Failed to delete notification" });
  }
};

const clearAllNotifications = async (req, res) => {
  try {
    const userId = req.user.id; 

    await Notification.deleteMany({ userId });

    res.status(200).json({ message: "All notifications cleared successfully" });
  } catch (err) {
    console.error("Failed to clear notifications:", err);
    res.status(500).json({ message: "Failed to clear notifications" });
  }
};

const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    await Notification.updateMany({ userId, read: false }, { read: true });
    res.status(200).json({ message: "All notifications marked as read" });
  } catch (err) {
    res.status(500).json({ error: "Failed to mark all as read" });
  }
};

module.exports = {
  addNotification, // utility
  createNotification, // route handler
  getNotifications,
  markAsRead,
  deleteNotification,
  clearAllNotifications,
  markAllAsRead
};
