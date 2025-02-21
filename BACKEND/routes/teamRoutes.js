import express from "express";
import {
  createTeam,
  getTeams,
  deleteTeam,
  addPlayerFromReserve,
} from "../controllers/teamController.js";

const router = express.Router();

router.post("/", createTeam);
router.get("/", getTeams);
router.delete("/:id", deleteTeam);
router.post("/:teamId/add-player-from-reserve", addPlayerFromReserve);

export default router;
