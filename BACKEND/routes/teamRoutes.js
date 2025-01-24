import express from "express";
import { addTeam, listTeams, removeTeam } from "../controllers/teamController.js";

const router = express.Router();

router.post("/", addTeam);
router.get("/", listTeams);
router.delete("/:teamId", removeTeam);

export default router;
