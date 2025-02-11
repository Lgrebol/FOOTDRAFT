import express from "express";
import {
  createMatchController,
  getMatchController,
  startMatchSimulationController,
  resetMatchController
} from "../controllers/matchController.js";

const router = express.Router();

router.post("/", createMatchController);
router.get("/:matchID", getMatchController);
router.post("/simulate", startMatchSimulationController);
router.post("/reset", resetMatchController);

export default router;
