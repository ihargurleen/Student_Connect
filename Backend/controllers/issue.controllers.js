
import { Issue } from "../models/issue.models.js";
import { Notification } from "../models/notification.model.js";

export const createIssue = async (req, res) => {
    try {
        const { title, description, location, category } = req.body;

        if (!title || !description || !location || !category) {
            return res.status(400).json({
                message: "Please fill all required fields"
            });
        }

        const issue = await Issue.create({
            title,
            description,
            location,
            category,
            reportedBy: req.userId.id
        });

        return res.status(201).json({
            message: "Issue reported successfully",
            issue
        });

    } catch (err) {
        return res.status(500).json({
            message: err.message
        });
    }
};

export const getAllIssues = async (req, res) => {
    try {
        const issues = await Issue.find().populate(
            "reportedBy",
            "userName email"
        );

        return res.status(200).json({
            message: "Issues fetched successfully",
            issues
        });

    } catch (err) {
        return res.status(500).json({
            message: err.message
        });
    }
};

export const updateIssue = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, location, category, status } = req.body;

        const issue = await Issue.findById(id);

        if (!issue) {
            return res.status(404).json({
                message: "Issue not found"
            });
        }

        const oldStatus = issue.status;

        if (title !== undefined) issue.title = title;
        if (description !== undefined) issue.description = description;
        if (location !== undefined) issue.location = location;
        if (category !== undefined) issue.category = category;
        if (status !== undefined) issue.status = status;

        await issue.save();

        if (status !== undefined && oldStatus !== issue.status) {
            await Notification.create({
                recipient: issue.reportedBy,
                title: "Issue Status Updated",
                message: `Your issue "${issue.title}" status changed from ${oldStatus} to ${issue.status}.`,
                type: "Issue",
                relatedId: issue._id
            });
        }

        return res.status(200).json({
            message: "Issue updated successfully",
            issue
        });

    } catch (err) {
        return res.status(500).json({
            message: err.message
        });
    }
};

export const deleteIssue = async (req, res) => {
    try {
        const { id } = req.params;

        const issue = await Issue.findByIdAndDelete(id);

        if (!issue) {
            return res.status(404).json({
                message: "Issue not found"
            });
        }

        return res.status(200).json({
            message: "Issue deleted successfully"
        });

    } catch (err) {
        return res.status(500).json({
            message: err.message
        });
    }
};
