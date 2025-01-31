import express from "express";
import { createMatchController, getMatchesController, updateMatchResultController } from "../controllers/matchController.js";

const router = express.Router();

// Ruta per crear un partit
router.post("/", createMatchController);

// Ruta per obtenir els partits d'un torneig
router.get("/:tournamentId", getMatchesController);

// Ruta per actualitzar el resultat d'un partit
router.put("/:matchId/result", updateMatchResultController);

export default router;
