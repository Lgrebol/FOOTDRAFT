import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDb from "./config/db.js"; // Connexió a la base de dades
import userRoutes from "./routes/userRoutes.js"; // Rutes per a usuaris
import playerRoutes from "./routes/playerRoutes.js"; // Rutes per a jugadors
import teamRoutes from "./routes/teamRoutes.js"; // Rutes per a equips

// Carregar variables d'entorn
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware global
app.use(express.json()); // Per processar JSON
app.use(cors()); // Per permetre sol·licituds des de qualsevol origen

// Rutes amb prefixos únics per recurs
app.use("/api/v1/users", userRoutes); // Rutes d'usuaris
app.use("/api/v1/players", playerRoutes); // Rutes de jugadors
app.use("/api/v1/teams", teamRoutes); // Rutes d'equips

// Connexió a la base de dades
connectDb().catch((err) => {
  console.error("Error connectant a la base de dades:", err);
});

// Ruta de prova per assegurar que el backend està en execució
app.get("/", (req, res) => {
  res.send("Backend per FOOTDRAFT està en execució correctament.");
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
