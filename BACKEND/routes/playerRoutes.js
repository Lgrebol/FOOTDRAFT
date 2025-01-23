import express from "express";
import { getAllPlayers, getPlayerById, addPlayer, updatePlayer, deletePlayer } from "../controllers/playerController.js"; // Assegura't que s'importin totes les funcions correctament

const router = express.Router();

router.get("/", getAllPlayers);        // Ruta per obtenir tots els jugadors
router.get("/:id", getPlayerById);     // Ruta per obtenir un jugador per ID
router.post("/", addPlayer);           // Ruta per crear un jugador
router.put("/:id", updatePlayer);     // Ruta per actualitzar un jugador
router.delete("/:id", deletePlayer);  // Ruta per eliminar un jugador

export default router;
