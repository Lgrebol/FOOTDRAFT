import express from "express";
import { createTeam, getTeams } from "../controllers/teamController.js";

const router = express.Router();

// Endpoint per crear un equip
router.post("/", createTeam);

// Endpoint per obtenir tots els equips
router.get("/", getTeams);

export default router;
