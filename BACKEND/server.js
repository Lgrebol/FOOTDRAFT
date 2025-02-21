import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDb from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import playerRoutes from "./routes/playerRoutes.js";
import teamRoutes from "./routes/teamRoutes.js";
import tournamentRoutes from "./routes/tournamentRoutes.js";
import matchRoutes from "./routes/matchRoutes.js";
import reserveRoutes from "./routes/reserveRoutes.js";
import betRoutes from "./routes/betRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors({
  origin: 'http://localhost:4200',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token'],
  exposedHeaders: ['x-auth-token'],
  credentials: true
}));

app.use("/api/v1/users", userRoutes);
app.use("/api/v1/players", playerRoutes);
app.use("/api/v1/teams", teamRoutes);
app.use("/api/v1/tournaments", tournamentRoutes);
app.use("/api/v1/matches", matchRoutes);
app.use("/api/v1/reserve", reserveRoutes);
app.use("/api/v1/bets", betRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);

connectDb().catch((err) => {
  console.error("Error connectant a la base de dades:", err);
});

app.get("/", (req, res) => {
  res.send("API per FOOTDRAFT està en execució correctament.");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
