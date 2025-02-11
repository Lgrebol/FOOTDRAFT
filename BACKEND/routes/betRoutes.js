import express from "express";
import { placeBetController } from "../controllers/betController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Aplica authMiddleware per protegir la ruta d'apostes
router.post("/", authMiddleware, placeBetController);

export default router;
