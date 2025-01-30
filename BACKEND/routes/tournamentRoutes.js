import express from "express";
import {
    createTournamentController,
    getTournamentsController,
    getTournamentByIdController,
    deleteTournamentController,
    registerTeamToTournamentController
} from "../controllers/tournamentController.js";

const router = express.Router();

// Crear un torneig
router.post("/", createTournamentController);

// Obtenir tots els torneigs
router.get("/", getTournamentsController);

// Obtenir un torneig per ID
router.get("/:id", getTournamentByIdController);

// Esborrar un torneig
router.delete("/:id", deleteTournamentController);

// Inscriure un equip a un torneig
router.post("/register", registerTeamToTournamentController);

export default router;
