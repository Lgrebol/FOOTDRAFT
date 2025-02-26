import express from "express";
import { getDashboardStats } from "../controllers/dashboardController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
const router = express.Router();

router.get("/", authMiddleware, getDashboardStats);

export default router;
