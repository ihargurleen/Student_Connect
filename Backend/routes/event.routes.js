import express from "express";
import { createEvent, deleteEvent, getAllEvents, updateEvent } from "../controllers/event.controllers.js";
import { protect } from "../middleware/protect.js";
import authorizeRoles from "../middleware/role.middleware.js";


const router = express.Router();
router.post("/create-event", protect, authorizeRoles("Admin", "Faculty"), createEvent );
router.get("/get-event", protect, getAllEvents);
router.post("/update-event/:id", protect, authorizeRoles("Admin", "Faculty"), updateEvent);
router.delete("/delete-event", protect, authorizeRoles("Admin", "Faculty"), deleteEvent);

export default router;