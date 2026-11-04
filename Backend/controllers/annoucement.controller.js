import { Annoucement } from "../models/annoucement.models.js";
import { Notification } from "../models/notification.model.js";
import { User } from "../models/user.models.js";

export const createAnnoucement = async (req, res) => {
    try {
        const { title, message, targetAudience } = req.body;

        if (!title || !message) {
            return res.status(400).json({
                message: "Title and message are required"
            });
        }

        const annoucement = await Annoucement.create({
            title,
            message,
            targetAudience,
            createdBy: req.userId.id
        });

        let userFilter = {};

        if (targetAudience && targetAudience !== "All") {
            userFilter.role = targetAudience;
        } else {
            userFilter.role = { $ne: "Admin" };
        }

        const users = await User.find(userFilter).select("_id");

        if (users.length > 0) {
            const notifications = users.map((user) => ({
                recipient: user._id,
                title: `New Announcement: ${title}`,
                message,
                type: "Announcement",
                relatedId: annoucement._id
            }));

            await Notification.insertMany(notifications);
        }

        return res.status(201).json({
            message: "Announcement created and notifications sent successfully",
            annoucement
        });

    } catch (err) {
        return res.status(500).json({
            message: err.message
        });
    }
};

export const getAllAnnoucements = async (req, res) => {
    try {
        const annoucements = await Annoucement.find()
            .populate("createdBy", "userName email");

        return res.status(200).json({
            message: "Annoucements fetched successfully",
            annoucements
        });

    } catch (err) {
        return res.status(500).json({
            message: err.message
        });
    }
};

export const updateAnnoucement = async (req, res) => {
    try {
        const { id } = req.params;

        const annoucement = await Annoucement.findByIdAndUpdate(
            id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!annoucement) {
            return res.status(404).json({
                message: "Announcement not found"
            });
        }

        return res.status(200).json({
            message: "Announcement updated successfully",
            annoucement
        });

    } catch (err) {
        return res.status(500).json({
            message: err.message
        });
    }
};

export const deleteAnnoucement = async (req, res) => {
    try {
        const { id } = req.params;

        const annoucement = await Annoucement.findByIdAndDelete(id);

        if (!annoucement) {
            return res.status(404).json({
                message: "Announcement not found"
            });
        }

        return res.status(200).json({
            message: "Announcement deleted successfully"
        });

    } catch (err) {
        return res.status(500).json({
            message: err.message
        });
    }
};