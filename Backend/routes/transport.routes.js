import express from "express";
import { createTransport, deleteTransport, getAllTransport, updateTransport } from "../controllers/transport.controllers.js";
import authorizeRoles from "../middleware/role.middleware.js";
import { protect } from "../middleware/protect.js";

const router = express.Router();

router.post("/create-transport",protect, authorizeRoles("Admin") ,createTransport);
router.get("/get-transport", protect, getAllTransport);
router.put("/update-transport/:id", protect, authorizeRoles("Admin"), updateTransport);
router.delete("/delete-transport/:id", protect , authorizeRoles("Admin"), deleteTransport);

export default router;