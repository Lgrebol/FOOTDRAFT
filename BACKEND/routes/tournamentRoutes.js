import express from "express";
import {
    createTournamentController,
    getTournamentsController,
    getTournamentByIdController,
    deleteTournamentController,
    registerTeamToTournamentController
} from "../controllers/tournamentController.js";

const router = express.Router();

router.post("/", createTournamentController);
router.get("/", getTournamentsController);
router.get("/:id", getTournamentByIdController);
router.delete("/:id", deleteTournamentController);
router.post("/register", registerTeamToTournamentController);

export default router;
