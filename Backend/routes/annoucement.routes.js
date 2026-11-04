import express from "express";
import { createAnnoucement, deleteAnnoucement, getAllAnnoucements, updateAnnoucement } from "../controllers/annoucement.controller.js";
import { protect } from "../middleware/protect.js";
import authorizeRoles from "../middleware/role.middleware.js";

const router = express.Router();

router.post("/create-ann", protect, authorizeRoles("Admin", "Faculty"), createAnnoucement);
router.get("/get-ann",protect ,getAllAnnoucements);
router.post("/update-ann/:id", protect, authorizeRoles("Admin", "Faculty"),updateAnnoucement);
router.delete("/delete-ann/:id", protect, authorizeRoles("Admin", "Faculty"), deleteAnnoucement);

export default router;
