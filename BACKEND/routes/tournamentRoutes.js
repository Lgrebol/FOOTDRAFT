import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import {
    createTournamentController,
    getTournamentsController,
    getTournamentByIdController,
    deleteTournamentController,
    registerTeamToTournamentController
} from "../controllers/tournamentController.js";

const router = express.Router();
router.use(authMiddleware);
router.post("/", createTournamentController);
router.get("/", getTournamentsController);
router.get("/:id", getTournamentByIdController);
router.delete("/:id", deleteTournamentController);
router.post("/register", registerTeamToTournamentController);

export default router;
