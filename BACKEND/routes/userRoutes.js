import express from "express";
import { registerUsers, loginUsers, getUsers } from "../controllers/userController.js";

const router = express.Router();

// Ruta per registrar un usuari
router.post("/register", registerUsers);

// Ruta per iniciar sessió
router.post("/login", loginUsers);

// Ruta per obtenir tots els usuaris
router.get("/", getUsers);

export default router;
