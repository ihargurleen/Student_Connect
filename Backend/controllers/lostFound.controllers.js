
import { LostFound } from "../models/lostFound.models.js";
import { Notification } from "../models/notification.model.js";
import { User } from "../models/user.models.js";

const getUserId = (req) => req.userId?.id || req.userId?._id;

const canManageItem = async (req, item) => {
    const userId = getUserId(req);

    const user = await User.findById(userId).select("role");

    if (!user) return false;

    return (
        user.role === "Admin" ||
        item.reportedBy.toString() === userId.toString()
    );
};

export const createLostFound = async (req, res) => {
    try {
        const { title, description, category, location, date } = req.body;

        if (!title || !description || !category || !location || !date) {
            return res.status(400).json({
                message: "Please fill all required fields"
            });
        }

        const item = await LostFound.create({
            title,
            description,
            category,
            location,
            date,
            reportedBy: getUserId(req)
        });

        const users = await User.find({
            _id: { $ne: getUserId(req) },
            role: { $ne: "Admin" }
        }).select("_id");

        if (users.length > 0) {
            const notifications = users.map((user) => ({
                recipient: user._id,
                title: `New Lost & Found Item: ${title}`,
                message: `${description} Location: ${location}. Category: ${category}.`,
                type: "LostFound",
                relatedId: item._id
            }));

            await Notification.insertMany(notifications);
        }

        return res.status(201).json({
            message: "Item reported and notifications sent successfully",
            item
        });

    } catch (err) {
        return res.status(500).json({
            message: err.message
        });
    }
};

export const getAllLostFound = async (req, res) => {
    try {
        const items = await LostFound.find().populate(
            "reportedBy",
            "userName email"
        );

        return res.status(200).json({
            message: "Lost and Found items fetched successfully",
            items
        });

    } catch (err) {
        return res.status(500).json({
            message: err.message
        });
    }
};

export const updateLostFound = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, category, location, date, status } = req.body;

        const item = await LostFound.findById(id);

        if (!item) {
            return res.status(404).json({
                message: "Lost and Found item not found"
            });
        }

        const allowed = await canManageItem(req, item);

        if (!allowed) {
            return res.status(403).json({
                message: "You can only update your own reported items"
            });
        }

        item.title = title ?? item.title;
        item.description = description ?? item.description;
        item.category = category ?? item.category;
        item.location = location ?? item.location;
        item.date = date ?? item.date;
        item.status = status ?? item.status;

        await item.save();

        return res.status(200).json({
            message: "Item updated successfully",
            item
        });

    } catch (err) {
        return res.status(500).json({
            message: err.message
        });
    }
};

export const deleteLostFound = async (req, res) => {
    try {
        const { id } = req.params;

        const item = await LostFound.findById(id);

        if (!item) {
            return res.status(404).json({
                message: "Lost and Found item not found"
            });
        }

        const allowed = await canManageItem(req, item);

        if (!allowed) {
            return res.status(403).json({
                message: "You can only delete your own reported items"
            });
        }

        await LostFound.findByIdAndDelete(id);

        return res.status(200).json({
            message: "Item deleted successfully"
        });

    } catch (err) {
        return res.status(500).json({
            message: err.message
        });
    }
};
