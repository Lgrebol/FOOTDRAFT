// routes/matchRoutes.js
import express from "express";
import {
  createMatchController, // <-- Comprova si realment existeix
  getMatchController,
  simulateMatchEventController,
  matchSummaryController
} from "../controllers/matchController.js";

const router = express.Router();

// Si no necessites crear una partida, pots comentar o eliminar aquesta línia:
// router.post("/", createMatchController);

router.get("/:id", getMatchController);
router.put("/simulate", simulateMatchEventController);
router.get("/summary/:matchID", matchSummaryController);

export default router;
