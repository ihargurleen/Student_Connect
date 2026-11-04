
import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

import {
  createResource,
  deleteResource,
  getAllResources,
  updateResource
} from "../controllers/resource.controllers.js";

import { protect } from "../middleware/protect.js";
import authorizeRoles from "../middleware/role.middleware.js";

const router = express.Router();

const uploadPath = path.resolve("uploads/resources");

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    cb(null, uniqueName);
  }
});

const allowedTypes = {
  ".pdf": ["application/pdf"],
  ".doc": ["application/msword"],
  ".docx": ["application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
  ".ppt": ["application/vnd.ms-powerpoint"],
  ".pptx": ["application/vnd.openxmlformats-officedocument.presentationml.presentation"],
  ".jpg": ["image/jpeg"],
  ".jpeg": ["image/jpeg"],
  ".png": ["image/png"],
  ".webp": ["image/webp"]
};

const fileFilter = (req, file, cb) => {
  const extension = path.extname(file.originalname).toLowerCase();
  const allowedMimeTypes = allowedTypes[extension];

  if (allowedMimeTypes && allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Allowed files: PDF, DOC, DOCX, PPT, PPTX, JPG, PNG and WEBP."));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024
  }
});

router.post(
  "/create-resource",
  protect,
  authorizeRoles("Admin", "Faculty", "Staff"),
  upload.single("resourceFile"),
  createResource
);

router.get("/get-resource", protect, getAllResources);

router.put(
  "/update-resource/:id",
  protect,
  authorizeRoles("Admin", "Faculty", "Staff"),
  upload.single("resourceFile"),
  updateResource
);

router.delete(
  "/delete-resource/:id",
  protect,
  authorizeRoles("Admin", "Faculty", "Staff"),
  deleteResource
);

export default router;
