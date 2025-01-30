import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDb from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import playerRoutes from "./routes/playerRoutes.js";
import teamRoutes from "./routes/teamRoutes.js";
import tournamentRoutes from "./routes/tournamentRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());

// Rutes per a usuaris
app.use("/api/v1/users", userRoutes);

// Rutes per a jugadors
app.use("/api/v1/players", playerRoutes);

// Rutes per a equips
app.use("/api/v1/teams", teamRoutes);

// Rutes per a tornejos
app.use("/api/v1/tournaments", tournamentRoutes);

// Connexió a la base de dades
connectDb().catch((err) => {
  console.error("Error connectant a la base de dades:", err);
});

// Ruta de prova
app.get("/", (req, res) => {
  res.send("API per FOOTDRAFT està en execució correctament.");
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});