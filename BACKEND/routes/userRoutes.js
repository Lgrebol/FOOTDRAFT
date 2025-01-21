import express from "express";
import { registerUsers, loginUsers } from "../controllers/userController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUsers);
router.post("/login", loginUsers);

router.use(authMiddleware);


export default router;
