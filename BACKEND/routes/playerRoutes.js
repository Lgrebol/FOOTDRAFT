import express from "express";
import { getPlayers, getPlayer, addPlayer, editPlayer, removePlayer } from "../controllers/playerController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/players", authMiddleware, getPlayers);
router.get("/players/:id", authMiddleware, getPlayer);
router.post("/players", authMiddleware, addPlayer);
router.put("/players/:id", authMiddleware, editPlayer);
router.delete("/players/:id", authMiddleware, removePlayer);

export default router;