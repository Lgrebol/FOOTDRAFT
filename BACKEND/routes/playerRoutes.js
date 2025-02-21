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
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/", upload.single("image"), createPlayer);
router.get("/", getPlayers);
router.get("/store", getPlayersForSale);
router.delete("/:id", deletePlayer);
router.post("/buy/:id", buyPlayer);

export default router;
