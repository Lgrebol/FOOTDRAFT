import express from "express";
import { getReservedPlayers } from "../controllers/reserveController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
const router = express.Router();

router.get("/:userId", authMiddleware, getReservedPlayers);

export default router;
