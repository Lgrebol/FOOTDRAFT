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
      .query(
        "INSERT INTO Teams (TeamName, ShirtColor, UserID) VALUES (@teamName, @shirtColor, @userID)"
      );
    res.status(201).send({ message: "Equip creat correctament." });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
};

// Obtenir tots els equips
export const getTeams = async (req, res) => {
  try {
    const pool = await connectDb();
    const result = await pool.request().query(`
      SELECT T.TeamID, T.TeamName, T.ShirtColor, U.Name AS UserName
      FROM Teams T
      LEFT JOIN Users U ON T.UserID = U.UserID
    `);
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
    await pool
      .request()
      .input("id", sql.Int, id)
      .query("DELETE FROM Teams WHERE TeamID = @id");
    res.status(200).send({ message: "Equip eliminat correctament." });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
};

// Traspassar un jugador reservat a un equip
export const addPlayerFromReserve = async (req, res) => {
  const { teamId } = req.params;
  const { playerId, userID } = req.body; // userID del propietari que té reservat el jugador

  if (!playerId || !userID) {
    return res
      .status(400)
      .send({ error: "Falten camps obligatoris: playerId i userID." });
  }

  try {
    const pool = await connectDb();
    // Comprovar que el jugador està reservat per aquest usuari
    const result = await pool
      .request()
      .input("playerId", sql.Int, playerId)
      .input("userID", sql.Int, userID)
      .query(
        "SELECT * FROM Players WHERE PlayerID = @playerId AND ReserveUserID = @userID"
      );

    if (result.recordset.length === 0) {
      return res.status(400).send({
        error: "Aquest jugador no està reservat per aquest usuari o no existeix.",
      });
    }

    // Actualitzar el jugador: assignar-lo a l'equip i buidar la reserva
    await pool
      .request()
      .input("playerId", sql.Int, playerId)
      .input("teamId", sql.Int, teamId)
      .query(`
        UPDATE Players 
        SET TeamID = @teamId,
            ReserveUserID = NULL
        WHERE PlayerID = @playerId
      `);

    res.status(200).send({ message: "Jugador traspassat a l'equip correctament." });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
};