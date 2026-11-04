import express from "express";
import { protect } from "../middleware/protect.js";
import { createLostFound, deleteLostFound, getAllLostFound, updateLostFound } from "../controllers/lostFound.controllers.js";

const router = express.Router();

router.post("/create-lost", protect, createLostFound);
router.get("/get-lost", protect, getAllLostFound);
router.put("/update-lost/:id", protect, updateLostFound);
router.delete("/delete-lost/:id", protect, deleteLostFound);

export default router;