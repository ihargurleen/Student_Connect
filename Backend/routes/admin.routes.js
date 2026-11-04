import express from "express";
import { protect } from "../middleware/protect.js";
import { authorizeRoles } from "../middleware/role.middleware.js";
import {
    createUser,
    deleteUser,
    getAllUsers,
    updateUserRole
} from "../controllers/admin.controllers.js";

const router = express.Router();

router.get(
    "/test",
    protect,
    authorizeRoles("Admin"),
    (req, res) => {
        res.status(200).json({
            message: "Admin access granted"
        });
    }
);

router.post(
    "/create-user",
    protect,
    authorizeRoles("Admin"),
    createUser
);

router.get(
    "/users",
    protect,
    authorizeRoles("Admin"),
    getAllUsers
);

router.delete(
    "/users/:id",
    protect,
    authorizeRoles("Admin"),
    deleteUser
);

router.put(
    "/users/:id/role",
    protect,
    authorizeRoles("Admin"),
    updateUserRole
);

export default router;
