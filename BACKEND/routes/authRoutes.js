import express from "express";
import { getCurrentUser } from "../controllers/authController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js"; // o la ruta correcta al teu middleware

const router = express.Router();

// Aquest endpoint només serà accessible si el token és vàlid (gràcies al authMiddleware)
router.get('/current-user', authMiddleware, getCurrentUser);

export default router;
