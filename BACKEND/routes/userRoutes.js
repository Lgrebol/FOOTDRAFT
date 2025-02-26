import express from "express";
import { registerUsers, loginUsers, getUsers } from "../controllers/userController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
const router = express.Router();

router.use(authMiddleware);
router.post("/register", registerUsers);
router.post("/login", loginUsers);
router.get("/", getUsers);

export default router;
