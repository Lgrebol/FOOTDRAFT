import express from "express";
import { registerUsers, loginUsers } from "../controllers/userController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Les rutes de registre i login per als usuaris
router.post("/register", registerUsers);
router.post("/login", loginUsers);

// Afegeix el middleware d'autenticació per a altres rutes si s'escau
//router.use(authMiddleware);

export default router;
