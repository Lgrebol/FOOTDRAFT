import express from "express";
import { registerUsers, loginUsers, getUsers } from "../controllers/userController.js";
const router = express.Router();

router.post("/register", registerUsers);
router.post("/login", loginUsers);
router.get("/", getUsers);

export default router;
