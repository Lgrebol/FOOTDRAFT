import sql from "mssql";
import connectDb from "../config/db.js";
import { deletePlayer as deletePlayerModel } from "../models/playerModel.js";

// Crear un jugador
export const createPlayer = async (req, res) => {
  const { playerName, position, teamID } = req.body;

  if (!playerName || !position || !teamID) {
    return res.status(400).send({ error: "Falten camps obligatoris." });
  }

  try {
    const pool = await connectDb();
    const query = `
      INSERT INTO Players (PlayerName, Position, TeamID)
      VALUES (@playerName, @position, @teamID)
    `;
    await pool.request()
      .input("playerName", sql.VarChar, playerName)
      .input("position", sql.VarChar, position)
      .input("teamID", sql.Int, teamID)
      .query(query);

    res.status(201).send({ message: "Jugador creat correctament." });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
};

// Obtenir tots els jugadors
export const getPlayers = async (req, res) => {
  try {
    const pool = await connectDb();
    const result = await pool.request().query("SELECT * FROM Players");
    res.status(200).json(result.recordset);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
};

// Controlador per eliminar un jugador
export const deletePlayer = async (req, res) => {
  try {
    const playerId = req.params.id; // Obtenim l'ID del jugador de la URL
    await deletePlayerModel(playerId); // Utilitza la funció del model per eliminar el jugador
    res.status(200).json({ message: "Jugador eliminat correctament" }); // Retorna una resposta exitosa
  } catch (error) {
    console.error("Error eliminant el jugador:", error);
    res.status(500).json({ message: "Error eliminant el jugador", error }); // Retorna un error del servidor
  }
};


