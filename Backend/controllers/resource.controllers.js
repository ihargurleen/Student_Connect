
import fs from "fs";
import path from "path";
import { Resource } from "../models/resource.models.js";
import { Notification } from "../models/notification.model.js";
import { User } from "../models/user.models.js";

export const createResource = async (req, res) => {
  try {
    const {
      title,
      description,
      subject,
      semester,
      resourceType,
      resourceUrl
    } = req.body || {};

    const finalResourceUrl =
      resourceType === "Link"
        ? resourceUrl
        : req.file
          ? `/uploads/resources/${req.file.filename}`
          : "";

    if (
      !title ||
      !description ||
      !subject ||
      !semester ||
      !resourceType ||
      !finalResourceUrl
    ) {
      return res.status(400).json({
        message: "All fields are required. Please upload a file or enter a URL."
      });
    }

    const resource = await Resource.create({
      title,
      description,
      subject,
      semester: Number(semester),
      resourceType,
      resourceUrl: finalResourceUrl,
      uploadedBy: req.userId.id
    });

    const students = await User.find({
      role: "Student"
    }).select("_id");

    if (students.length > 0) {
      const notifications = students.map((student) => ({
        recipient: student._id,
        title: `New Study Resource: ${title}`,
        message: `${description} Subject: ${subject}. Semester: ${semester}. Resource Type: ${resourceType}.`,
        type: "Resource",
        relatedId: resource._id
      }));

      await Notification.insertMany(notifications);
    }

    return res.status(201).json({
      message: "Resource created and students notified successfully",
      resource
    });

  } catch (err) {
    if (req.file) {
      fs.unlink(req.file.path, () => {});
    }

    return res.status(500).json({
      message: err.message
    });
  }
};

export const getAllResources = async (req, res) => {
  try {
    const resources = await Resource.find()
      .populate("uploadedBy", "userName email");

    return res.status(200).json({
      message: "Resources fetched successfully",
      resources
    });

  } catch (err) {
    return res.status(500).json({
      message: err.message
    });
  }
};

export const updateResource = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      title,
      description,
      subject,
      semester,
      resourceType,
      resourceUrl
    } = req.body || {};

    const existingResource = await Resource.findById(id);

    if (!existingResource) {
      return res.status(404).json({
        message: "Resource not found"
      });
    }

    const finalResourceUrl =
      resourceType === "Link"
        ? resourceUrl
        : req.file
          ? `/uploads/resources/${req.file.filename}`
          : existingResource.resourceUrl;

    if (
      !title ||
      !description ||
      !subject ||
      !semester ||
      !resourceType ||
      !finalResourceUrl
    ) {
      return res.status(400).json({
        message: "All fields are required."
      });
    }

    const oldResourceUrl = existingResource.resourceUrl;

    existingResource.title = title;
    existingResource.description = description;
    existingResource.subject = subject;
    existingResource.semester = Number(semester);
    existingResource.resourceType = resourceType;
    existingResource.resourceUrl = finalResourceUrl;

    await existingResource.save();

    if (
      req.file &&
      oldResourceUrl?.startsWith("/uploads/resources/")
    ) {
      const oldFilePath = path.resolve(
        oldResourceUrl.replace(/^\//, "")
      );

      fs.unlink(oldFilePath, () => {});
    }

    return res.status(200).json({
      message: "Resource updated successfully",
      resource: existingResource
    });

  } catch (err) {
    if (req.file) {
      fs.unlink(req.file.path, () => {});
    }

    return res.status(500).json({
      message: err.message
    });
  }
};

export const deleteResource = async (req, res) => {
  try {
    const { id } = req.params;

    const resource = await Resource.findByIdAndDelete(id);

    if (!resource) {
      return res.status(404).json({
        message: "Resource not found"
      });
    }

    if (resource.resourceUrl?.startsWith("/uploads/resources/")) {
      const filePath = path.resolve(
        resource.resourceUrl.replace(/^\//, "")
      );

      fs.unlink(filePath, () => {});
    }

    return res.status(200).json({
      message: "Resource deleted successfully"
    });

  } catch (err) {
    return res.status(500).json({
      message: err.message
    });
  }
};
