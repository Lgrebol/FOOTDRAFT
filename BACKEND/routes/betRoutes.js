import express from "express";
import { placeBetController } from "../controllers/betController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, placeBetController);

export default router;
