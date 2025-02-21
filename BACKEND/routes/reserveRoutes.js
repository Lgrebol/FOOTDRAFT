import express from "express";
import { getReservedPlayers } from "../controllers/reserveController.js";

const router = express.Router();

router.get("/:userId", getReservedPlayers);

export default router;
