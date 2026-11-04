
import express from "express";
import {
    signup,
    login,
    getUser,
    logout
} from "../controllers/auth.controllers.js";

import { protect } from "../middleware/protect.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/get-user", protect, getUser);
router.post("/logout", logout);

export default router;
