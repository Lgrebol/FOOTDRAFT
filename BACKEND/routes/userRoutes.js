import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { registerUsers, loginUsers } from "../controllers/userController.js";

const router = express.Router();

router.use(authMiddleware);
router.post("/register", registerUsers);
router.post("/login", loginUsers);

export default router;
