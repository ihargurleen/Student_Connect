
import express from "express";
import { protect } from "../middleware/protect.js";
import authorizeRoles from "../middleware/role.middleware.js";
import {
    createNotification,
    deleteNotification,
    getMyNotification,
    markNotificationAsRead
} from "../controllers/notification.controllers.js";

const router = express.Router();

router.post(
    "/create-notification",
    protect,
    authorizeRoles("Admin"),
    createNotification
);

router.get(
    "/my-notifications",
    protect,
    getMyNotification
);

router.put(
    "/mark-read/:id",
    protect,
    markNotificationAsRead
);

router.delete(
    "/delete-notification/:id",
    protect,
    deleteNotification
);

export default router;
