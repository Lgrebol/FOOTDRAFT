import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDb from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import playerRoutes from "./routes/playerRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());

// Rutes amb prefix únic per a cada recurs
app.use("/api/v1/users", userRoutes); // Canviat a /api/v1/users
app.use("/api/v1/players", playerRoutes); // Rutes per a jugadors

// Connexió a la base de dades
connectDb().catch((err) => {
  console.error("Database connection error:", err);
});

// Ruta de prova
app.get("/", (req, res) => {
  res.send("Backend per FOOTDRAFT està en execució");
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
