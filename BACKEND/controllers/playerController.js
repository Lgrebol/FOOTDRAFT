import sql from "mssql";
import connectDb from "../config/db.js";

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
    await pool
      .request()
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
    const result = await pool.request().query(`
      SELECT p.*, t.TeamName 
      FROM Players p
      LEFT JOIN Teams t ON p.TeamID = t.TeamID
    `);
    res.status(200).json(result.recordset);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
};


// Eliminar un jugador
export const deletePlayer = async (req, res) => {
  const playerId = req.params.id;

  try {
    const pool = await connectDb();
    await pool
      .request()
      .input("playerId", sql.Int, playerId)
      .query("DELETE FROM Players WHERE PlayerID = @playerId");
    res.status(200).send({ message: "Jugador eliminat correctament." });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
};

// Obtenir els jugadors disponibles a la tenda
export const getPlayersForSale = async (req, res) => {
  try {
    const pool = await connectDb();
    const result = await pool
      .request()
      .query("SELECT * FROM Players WHERE IsForSale = 1 AND ReserveUserID IS NULL");
    res.status(200).json(result.recordset);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
};

// Comprar un jugador (passant el userID del comprador al cos de la petició)
export const buyPlayer = async (req, res) => {
  const playerId = req.params.id;
  const { userID } = req.body; // En un entorn real, s'obtindria del token d'autenticació

  if (!userID) {
    return res.status(400).send({ error: "Falta el userID del comprador." });
  }

  try {
    const pool = await connectDb();
    // Comprovar que el jugador està disponible a la tenda
    const result = await pool
      .request()
      .input("playerId", sql.Int, playerId)
      .query(
        "SELECT * FROM Players WHERE PlayerID = @playerId AND IsForSale = 1 AND ReserveUserID IS NULL"
      );

    if (result.recordset.length === 0) {
      return res
        .status(400)
        .send({ error: "Aquest jugador no està disponible per a la compra." });
    }

    // Actualitzar el jugador: assignar ReserveUserID i marcar-lo com no a la venda
    await pool
      .request()
      .input("playerId", sql.Int, playerId)
      .input("userID", sql.Int, userID)
      .query(`
        UPDATE Players 
        SET ReserveUserID = @userID,
            IsForSale = 0
        WHERE PlayerID = @playerId
      `);

    res
      .status(200)
      .send({ message: "Jugador comprat i afegit a la reserva correctament." });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
};
