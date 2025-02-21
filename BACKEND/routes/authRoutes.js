import express from "express";
import { getCurrentUser } from "../controllers/authController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get('/current-user', authMiddleware, getCurrentUser);

export default router;
