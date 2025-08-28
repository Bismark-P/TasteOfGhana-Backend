import express from "express";
import {
  createNotification,
  getNotifications,
  markAsRead,
  deleteNotification,
} from "../controllers/notificationsController.js";

const router = express.Router();

// Create a new notification
router.post("/", createNotification);

// Get all notifications for a user
router.get("/:userId", getNotifications);

// Mark notification as read
router.patch("/:id/read", markAsRead);

// Delete notification
router.delete("/:id", deleteNotification);

export default router;
