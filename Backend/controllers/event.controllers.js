
import { Event } from "../models/event.models.js";
import { Notification } from "../models/notification.model.js";
import { User } from "../models/user.models.js";

export const createEvent = async (req, res) => {
    try {
        const { title, description, venue, eventDate, targetAudience } = req.body;

        if (!title || !description || !venue || !eventDate) {
            return res.status(400).json({
                message: "Please fill all required fields"
            });
        }

        const event = await Event.create({
            title,
            description,
            venue,
            eventDate,
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
                title: `New Event: ${title}`,
                message: `${description} Venue: ${venue}. Date: ${eventDate}`,
                type: "Event",
                relatedId: event._id
            }));

            await Notification.insertMany(notifications);
        }

        return res.status(201).json({
            message: "Event created and notifications sent successfully",
            event
        });

    } catch (err) {
        return res.status(500).json({
            message: err.message
        });
    }
};

export const getAllEvents = async (req, res) => {
    try {
        const events = await Event.find().populate("createdBy", "userName email");

        return res.status(200).json({
            message: "Events fetched successfully",
            events
        });

    } catch (err) {
        return res.status(500).json({
            message: err.message
        });
    }
};

export const updateEvent = async (req, res) => {
    try {
        const { id } = req.params;

        const event = await Event.findByIdAndUpdate(
            id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!event) {
            return res.status(404).json({
                message: "Event not found"
            });
        }

        return res.status(200).json({
            message: "Event updated successfully",
            event
        });

    } catch (err) {
        return res.status(500).json({
            message: err.message
        });
    }
};

export const deleteEvent = async (req, res) => {
    try {
        const { id } = req.params;

        const event = await Event.findByIdAndDelete(id);

        if (!event) {
            return res.status(404).json({
                message: "Event not found"
            });
        }

        return res.status(200).json({
            message: "Event deleted successfully"
        });

    } catch (err) {
        return res.status(500).json({
            message: err.message
        });
    }
};
