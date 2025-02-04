import express from "express";
import {
  createPlayer,
  getPlayers,
  deletePlayer,
  getPlayersForSale,
  buyPlayer,
} from "../controllers/playerController.js";

const router = express.Router();

// Crear un jugador
router.post("/", createPlayer);

// Obtenir tots els jugadors
router.get("/", getPlayers);

// Obtenir els jugadors disponibles a la tenda
router.get("/store", getPlayersForSale);

// Eliminar un jugador
router.delete("/:id", deletePlayer);

// Comprar un jugador (passa el playerID per la URL i el userID al cos)
router.post("/buy/:id", buyPlayer);

export default router;
