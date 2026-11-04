import express from "express";
import { protect } from "../middleware/protect.js";
import { createLocation, deleteLocation, getAllLocations, searchLocations, updateLocation } from "../controllers/location.controllers.js";
import { authorizeRoles } from "../middleware/role.middleware.js";

const router = express.Router();

router.post("/create", protect,
     authorizeRoles("Admin"), createLocation);
router.get("/get", protect, getAllLocations);   
router.put("/update/:id", protect, authorizeRoles("Admin"), updateLocation);
router.delete("/delete/:id", protect, authorizeRoles("Admin"), deleteLocation);
router.get("/search", protect, searchLocations);  

export default router;