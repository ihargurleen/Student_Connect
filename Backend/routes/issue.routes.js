import express from "express";
import { createIssue, deleteIssue, getAllIssues, updateIssue } from "../controllers/issue.controllers.js";
import { protect } from "../middleware/protect.js";
import authorizeRoles from "../middleware/role.middleware.js"

const router = express.Router();

router.post("/create-issue", protect, createIssue);
router.get("/get-issue", protect, getAllIssues);
router.put("/update-issue/:id", protect, authorizeRoles("Admin"), updateIssue);
router.delete("/delete-issue/:id", protect, authorizeRoles("Admin"), deleteIssue);

export default router;
