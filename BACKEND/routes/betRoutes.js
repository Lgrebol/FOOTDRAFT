// routes/betRoutes.js
import express from "express";
import { placeBetController } from "../controllers/betController.js";

const router = express.Router();

// POST /api/v1/bets -> Realitza una aposta
router.post("/", placeBetController);

export default router;
