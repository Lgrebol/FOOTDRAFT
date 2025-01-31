import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDb from "./config/db.js";  // Connexió a la base de dades
import userRoutes from "./routes/userRoutes.js";  // Rutes per a usuaris
import playerRoutes from "./routes/playerRoutes.js";  // Rutes per a jugadors
import teamRoutes from "./routes/teamRoutes.js";  // Rutes per a equips
import tournamentRoutes from "./routes/tournamentRoutes.js";  // Rutes per a tornejos
import matchRoutes from "./routes/matchRoutes.js";

dotenv.config();  // Carregar variables d'entorn des del fitxer .env

const app = express();
const PORT = process.env.PORT || 3000;  // Port per a l'aplicació

// Middleware
app.use(express.json());  // Permet que l'API accepti JSON en el cos de la petició
app.use(cors({
  origin: 'http://localhost:4200'  // Permet accedir des de l'aplicació Angular
}));

// Rutes per a usuaris
app.use("/api/v1/users", userRoutes);

// Rutes per a jugadors
app.use("/api/v1/players", playerRoutes);

// Rutes per a equips
app.use("/api/v1/teams", teamRoutes);

// Rutes per a tornejos
app.use("/api/v1/tournaments", tournamentRoutes);

//Rutes per agafar el match
app.use("/api/v1/matches", matchRoutes);

// Connexió a la base de dades
connectDb().catch((err) => {
  console.error("Error connectant a la base de dades:", err);  // Si hi ha un error a la connexió de la base de dades
});

// Ruta de prova
app.get("/", (req, res) => {
  res.send("API per FOOTDRAFT està en execució correctament.");  // Missatge que confirma que l'API està en execució
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);  // Missatge que mostra que el servidor està en marxa
});
