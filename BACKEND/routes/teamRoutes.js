import express from "express";
import {
  createTeam,
  getTeams,
  deleteTeam,
  addPlayerFromReserve,
} from "../controllers/teamController.js";

const router = express.Router();

// Crear un equip
router.post("/", createTeam);

// Obtenir tots els equips
router.get("/", getTeams);

// Eliminar un equip
router.delete("/:id", deleteTeam);

// Assignar un jugador reservat a un equip (traspassar-lo)
router.post("/:teamId/add-player-from-reserve", addPlayerFromReserve);

export default router;
