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
    const query = `
      INSERT INTO Teams (TeamName, ShirtColor, UserID)
      VALUES (@teamName, @shirtColor, @userID)
    `;
    await pool.request()
      .input("teamName", sql.VarChar, teamName)
      .input("shirtColor", sql.VarChar, shirtColor)
      .input("userID", sql.Int, userID)
      .query(query);

    res.status(201).send({ message: "Equip creat correctament." });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
};

// Obtenir tots els equips
export const getTeams = async (req, res) => {
  try {
    const pool = await connectDb();
    const query = `
      SELECT TeamID, TeamName, TeamLogo, ShirtColor, UserID, IsActive
      FROM Teams
    `;
    const result = await pool.request().query(query);
    res.status(200).send(result.recordset);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
};
