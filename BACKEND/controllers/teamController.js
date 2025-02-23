import sql from "mssql";
import connectDb from "../config/db.js";

export const createTeam = async (req, res) => {
  // Validació millorada
  const requiredFields = ['teamName', 'shirtColor', 'userID'];
  const missingFields = requiredFields.filter(field => !req.body[field]);
  
  if (missingFields.length > 0) {
    return res.status(400).send({ 
      error: `Falten camps: ${missingFields.join(', ')}`,
      campsRebuts: req.body 
    });
  }

  try {
    const pool = await connectDb();
    await pool.request()
      .input("teamName", sql.VarChar, req.body.teamName)
      .input("shirtColor", sql.VarChar, req.body.shirtColor)
      .input("userID", sql.UniqueIdentifier, req.body.userID)
      .query("INSERT INTO Teams (TeamName, ShirtColor, UserUUID) VALUES (@teamName, @shirtColor, @userID)");
    
    res.status(201).send({ message: "Equip creat correctament." });
  } catch (err) {
    console.error("Error creant equip:", {
      query: err.query,
      params: req.body,
      error: err.message
    });
    res.status(500).send({ error: "Error intern del servidor" });
  }
};

export const getTeams = async (req, res) => {
  try {
    const pool = await connectDb();
    const result = await pool.request().query(`
      SELECT T.TeamUUID, T.TeamName, T.ShirtColor, U.Name AS UserName
      FROM Teams T
      LEFT JOIN Users U ON T.UserUUID = U.UserUUID
    `);
    res.status(200).send(result.recordset);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
};

export const deleteTeam = async (req, res) => {
  const { id } = req.params;

  try {
    const pool = await connectDb();
    await pool
      .request()
      .input("id", sql.UniqueIdentifier, id)
      .query("DELETE FROM Teams WHERE TeamUUID = @id");
    res.status(200).send({ message: "Equip eliminat correctament." });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
};

export const addPlayerFromReserve = async (req, res) => {
  const { teamId } = req.params;
  const { playerId, userID } = req.body;

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  
  if (!uuidRegex.test(teamId) || !uuidRegex.test(playerId) || !uuidRegex.test(userID)) {
    return res.status(400).send({ error: "IDs invàlids" });
  }

  if (![teamId, playerId, userID].every(id => uuidRegex.test(id))) {
    return res.status(400).send({ 
      error: "Format d'ID invàlid",
      exempleValid: "123e4567-e89b-12d3-a456-426614174000"
    });
  }
  
  if (!playerId || !userID) {
    return res.status(400).send({ error: "Falten camps obligatoris: playerId i userID." });
  }

  try {
    const pool = await connectDb();
    const result = await pool
      .request()
      .input("playerId", sql.UniqueIdentifier, playerId)
      .input("userID", sql.UniqueIdentifier, userID)
      .query("SELECT * FROM Players WHERE PlayerUUID = @playerId AND ReserveUserUUID = @userID");

    if (result.recordset.length === 0) {
      return res.status(400).send({
        error: "Aquest jugador no està reservat per aquest usuari o no existeix.",
      });
    }

    const countResult = await pool
      .request()
      .input("teamId", sql.UniqueIdentifier, teamId)
      .query("SELECT COUNT(*) AS playerCount FROM Players WHERE TeamUUID = @teamId AND IsActive = 1"); 
    const playerCount = countResult.recordset[0].playerCount;
    if (playerCount >= 5) {
      return res.status(400).send({ error: "Aquest equip ja té 5 jugadors." });
    }

    await pool
      .request()
      .input("playerId", sql.UniqueIdentifier, playerId)
      .input("teamId", sql.UniqueIdentifier, teamId)
      .query(
        `UPDATE Players 
         SET TeamUUID = @teamId,
             ReserveUserUUID = NULL  
         WHERE PlayerUUID = @playerId`
      );

    res.status(200).send({ message: "Jugador traspassat a l'equip correctament." });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
};
