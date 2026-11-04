
import { Notification } from "../models/notification.model.js";
import { User } from "../models/user.models.js";

export const createNotification = async (req, res) => {
  try {
    const { recipientRole, title, message, type, relatedId } = req.body;

    if (!recipientRole || !title || !message) {
      return res.status(400).json({
        message: "Recipient, title and message are required"
      });
    }

    const allowedRoles = [
      "Student",
      "Faculty",
      "Staff",
      "Everyone"
    ];

    if (!allowedRoles.includes(recipientRole)) {
      return res.status(400).json({
        message: "Invalid recipient category"
      });
    }

    const userRoles = ["Student", "Faculty", "Staff"];

    const users = await User.find({
      role:
        recipientRole === "Everyone"
          ? { $in: userRoles }
          : recipientRole
    }).select("_id");

    if (users.length === 0) {
      return res.status(404).json({
        message: `No ${recipientRole} users found`
      });
    }

    const notifications = users.map((user) => ({
      recipient: user._id,
      title,
      message,
      type: type || "General",
      relatedId: relatedId || null
    }));

    const createdNotifications =
      await Notification.insertMany(notifications);

    return res.status(201).json({
      message: `Notification sent successfully to ${recipientRole}`,
      totalRecipients: createdNotifications.length
    });

  } catch (err) {
    console.log("Create Notification Error:", err);

    return res.status(500).json({
      message: err.message
    });
  }
};


export const getMyNotification = async (req, res) => {
  try {
    const notifications = await Notification.find({
      recipient: req.userId.id
    })
      .populate("recipient", "userName email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Notifications fetched successfully",
      notifications
    });

  } catch (err) {
    return res.status(500).json({
      message: err.message
    });
  }
};


export const markNotificationAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      {
        _id: req.params.id,
        recipient: req.userId.id
      },
      {
        isRead: true
      },
      {
        new: true,
        runValidators: true
      }
    );

    if (!notification) {
      return res.status(404).json({
        message: "Notification not found"
      });
    }

    return res.status(200).json({
      message: "Notification marked as read",
      notification
    });

  } catch (err) {
    return res.status(500).json({
      message: err.message
    });
  }
};


export const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      recipient: req.userId.id
    });

    if (!notification) {
      return res.status(404).json({
        message: "Notification not found"
      });
    }

    return res.status(200).json({
      message: "Notification deleted successfully"
    });

  } catch (err) {
    return res.status(500).json({
      message: err.message
    });
  }
};
