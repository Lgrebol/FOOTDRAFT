import express from "express";
import { createPlayer, getPlayers } from "../controllers/playerController.js";

const router = express.Router();

// Endpoint per crear un jugador
router.post("/", createPlayer);

// Endpoint per obtenir tots els jugadors
router.get("/", getPlayers);

export default router;
