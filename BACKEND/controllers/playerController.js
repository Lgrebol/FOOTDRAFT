import sql from "mssql";
import connectDb from "../config/db.js";

// Crear un jugador
export const createPlayer = async (req, res) => {
  // Els camps del cos de la petició
  const { playerName, position, teamID } = req.body;
  
  // Verifiquem que el fitxer s'ha pujat correctament
  if (!req.file) {
    return res.status(400).send({ error: "Cal pujar una imatge." });
  }

  // Obtenim el buffer del fitxer
  const imageBuffer = req.file.buffer;

  if (!playerName || !position || !teamID) {
    return res.status(400).send({ error: "Falten camps obligatoris." });
  }

  try {
    const pool = await connectDb();
    const query = `
      INSERT INTO Players (PlayerName, Position, TeamID, PlayerImage)
      VALUES (@playerName, @position, @teamID, @playerImage)
    `;
    await pool
      .request()
      .input("playerName", sql.VarChar, playerName)
      .input("position", sql.VarChar, position)
      .input("teamID", sql.Int, teamID)
      // Insertem el buffer de la imatge
      .input("playerImage", sql.VarBinary(sql.MAX), imageBuffer)
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
// Obtenir els jugadors disponibles a la tenda amb filtre opcional de cerca i preu
export const getPlayersForSale = async (req, res) => {
  try {
    const pool = await connectDb();
    // Consulta base
    let query = `
      SELECT * FROM Players 
      WHERE IsForSale = 1 AND ReserveUserID IS NULL
    `;

    // Extreure els paràmetres de la query string
    const { search, minPrice, maxPrice } = req.query;

    // Afegir condicions segons els paràmetres rebuts
    if (search) {
      query += " AND PlayerName LIKE @search";
    }
    if (minPrice) {
      query += " AND Price >= @minPrice";
    }
    if (maxPrice) {
      query += " AND Price <= @maxPrice";
    }

    // Preparar la request
    const request = pool.request();
    if (search) {
      // Afegim els % per a fer la cerca amb LIKE
      request.input("search", sql.VarChar, `%${search}%`);
    }
    if (minPrice) {
      request.input("minPrice", sql.Decimal, minPrice);
    }
    if (maxPrice) {
      request.input("maxPrice", sql.Decimal, maxPrice);
    }

    const result = await request.query(query);
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
