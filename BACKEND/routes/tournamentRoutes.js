import express from "express";
import { getAllTournaments, getTournamentById, createTournament, updateTournament, deleteTournament } from "../controllers/tournamentController.js";

const router = express.Router();

router.get("/", getAllTournaments);
router.get("/:id", getTournamentById);
router.post("/", createTournament);
router.put("/:id", updateTournament);
router.delete("/:id", deleteTournament);

export default router;
