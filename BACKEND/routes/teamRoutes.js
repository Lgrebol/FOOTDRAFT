import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import {
  createTeam,
  getTeams,
  deleteTeam,
  addPlayerFromReserve,
} from "../controllers/teamController.js";

const router = express.Router();
router.use(authMiddleware);
router.post("/", createTeam);
router.get("/", getTeams);
router.delete("/:id", deleteTeam);
router.post("/:teamId/add-player-from-reserve", addPlayerFromReserve);

export default router;
