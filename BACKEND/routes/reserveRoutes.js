import express from "express";
import { getReservedPlayers } from "../controllers/reserveController.js";

const router = express.Router();

// GET /api/v1/reserve/:userId
router.get("/:userId", getReservedPlayers);

export default router;
