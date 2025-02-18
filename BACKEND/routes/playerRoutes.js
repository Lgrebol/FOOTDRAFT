import express from "express";
import multer from "multer";
import {
  createPlayer,
  getPlayers,
  deletePlayer,
  getPlayersForSale,
  buyPlayer,
} from "../controllers/playerController.js";

const router = express.Router();

// Configuració de multer per guardar el fitxer a memòria
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Crear un jugador amb pujada d'imatge
router.post("/", upload.single("image"), createPlayer);

// Obtenir tots els jugadors
router.get("/", getPlayers);

// Obtenir els jugadors disponibles a la tenda
router.get("/store", getPlayersForSale);

// Eliminar un jugador
router.delete("/:id", deletePlayer);

// Comprar un jugador
router.post("/buy/:id", buyPlayer);

export default router;
