import userRoutes from "./routes/userRoutes.js"; 
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDb = require("./config/db");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());
app.use("/api/v1", userRoutes);
// Connexió amb la base de dades
connectDb().catch((err) => {
  console.error("No s'ha pogut establir la connexió amb la base de dades:", err);
});

// Endpoint de prova
app.get("/", (req, res) => {
  res.send("Backend for FOOTDRAFT is running");
});

// Inicialitza el servidor
app.listen(PORT, () => {
  console.log(`Servidor funcionant al port ${PORT}`);
});
