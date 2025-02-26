import express from "express";
import multer from "multer";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import {
  createPlayer,
  getPlayers,
  deletePlayer,
  updatePlayer,
  getPlayersForSale,
  buyPlayer,
} from "../controllers/playerController.js";

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Apply authMiddleware to all routes in this router
router.use(authMiddleware);

router.post("/", upload.single("image"), createPlayer);
router.get("/", getPlayers);
router.put("/:id", upload.single("image"), updatePlayer);
router.delete("/:id", deletePlayer);
router.post("/buy/:id", buyPlayer);
router.get("/store", getPlayersForSale);

export default router;
