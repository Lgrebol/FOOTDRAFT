import sql from "mssql";
import connectDb from "../config/db.js";

// Crear un equip
export const createTeam = async (req, res) => {
  const { teamName, shirtColor, userID } = req.body;

  if (!teamName || !shirtColor || !userID) {
    return res.status(400).send({ error: "Falten camps obligatoris." });
  }

  try {
    const pool = await connectDb();
    await pool
      .request()
      .input("teamName", sql.VarChar, teamName)
      .input("shirtColor", sql.VarChar, shirtColor)
      .input("userID", sql.Int, userID)
      .query("INSERT INTO Teams (TeamName, ShirtColor, UserID) VALUES (@teamName, @shirtColor, @userID)");
    res.status(201).send({ message: "Equip creat correctament." });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
};

// Obtenir tots els equips
export const getTeams = async (req, res) => {
  try {
    const pool = await connectDb();
    const result = await pool.request().query("SELECT * FROM Teams");
    res.status(200).send(result.recordset);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
};

// Eliminar un equip
export const deleteTeam = async (req, res) => {
  const { id } = req.params;

  try {
    const pool = await connectDb();
    await pool.request().input("id", sql.Int, id).query("DELETE FROM Teams WHERE TeamID = @id");
    res.status(200).send({ message: "Equip eliminat correctament." });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
};