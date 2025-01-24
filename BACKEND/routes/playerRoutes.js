import express from "express";
import {
  addPlayer,
  listPlayers,
  listPlayersByTeam,
  removePlayer,
} from "../controllers/playerController.js";

const router = express.Router();

router.post("/", addPlayer);
router.get("/", listPlayers);
router.get("/team/:teamId", listPlayersByTeam);
router.delete("/:playerId", removePlayer);

export default router;
