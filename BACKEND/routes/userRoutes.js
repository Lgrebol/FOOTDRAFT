import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { registerUsers, loginUsers } from "../controllers/userController.js";

const router = express.Router();

// Middleware únic per sanejar, autenticar i registrar logs
router.use(authMiddleware);

// Endpoint per a registre d'usuaris
router.post("/register", registerUsers);

// Endpoint per al login d'usuaris
router.post("/login", loginUsers);

export default router;
