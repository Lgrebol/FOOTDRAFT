import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDb from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());
app.use("/api/v1", userRoutes);

// Database connection
connectDb().catch((err) => {
  console.error("Database connection error:", err);
});

// Test endpoint
app.get("/", (req, res) => {
  res.send("Backend for FOOTDRAFT is running");
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
