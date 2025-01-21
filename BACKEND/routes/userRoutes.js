import express from "express";
import { registerUsers, loginUsers } from "../controllers/userController.js"; // Asegura't que el camí és correcte
import { authenticateToken } from "../middlewares/authMiddleware.js"; // Canvia a authMiddleware.js
import { sanitizeData } from "../middlewares/authMiddleware.js"; // Sanejar les dades també prové de l'autenticació

const router = express.Router();

// Middleware per sanejar les dades entrades
router.use(sanitizeData);

// Ruta per registrar un usuari
router.post("/register", registerUsers);

// Ruta per iniciar sessió
router.post("/login", loginUsers);

// Ruta d'exemple per protegir amb autenticació de token
// Aquesta ruta només és accessible si es proporciona un token vàlid
router.get(
  "/protected",
  authenticateToken, // Middleware per validar el token
  (req, res) => {
    res.status(200).json({ message: "Accés concedit!" });
  }
);

export default router;
