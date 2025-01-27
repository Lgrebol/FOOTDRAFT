import express from "express";
import { createPlayer, getPlayers, deletePlayer } from "../controllers/playerController.js";

const router = express.Router();

// Endpoint per crear un jugador
router.post("/", createPlayer);

// Endpoint per obtenir tots els jugadors
router.get("/", getPlayers);

// Endpoint per eliminar un jugador
router.delete("/:id", deletePlayer);

export default router;
