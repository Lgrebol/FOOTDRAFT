import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import {
  createMatchController,
  getMatchController,
  startMatchSimulationController,
  resetMatchController
} from "../controllers/matchController.js";

const router = express.Router();

router.post("/", authMiddleware, createMatchController);
router.get("/:matchID", authMiddleware, getMatchController);
router.post("/simulate", authMiddleware, startMatchSimulationController);
router.post("/reset", authMiddleware, resetMatchController);

export default router;
