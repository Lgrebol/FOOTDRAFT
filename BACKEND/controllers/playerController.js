import sql from "mssql";
import connectDb from "../config/db.js";

export const createPlayer = async (req, res) => {
  const { playerName, position, teamID, isActive, isForSale, price, height, speed, shooting } = req.body;
  
  if (!req.file) {
    return res.status(400).send({ error: "Cal pujar una imatge." });
  }
  
  if (!playerName || !position || !teamID) {
    return res.status(400).send({ error: "Falten camps obligatoris." });
  }
  
  const imageBase64 = req.file.buffer.toString('base64');
  
  try {
    const pool = await connectDb();
    const query = `
      INSERT INTO Players (PlayerName, Position, TeamUUID, IsActive, IsForSale, Price, Height, Speed, Shooting, PlayerImage)
      VALUES (@playerName, @position, @teamUUID, @isActive, @isForSale, @price, @height, @speed, @shooting, @playerImage)
    `;
    await pool
      .request()
      .input("playerName", sql.VarChar, playerName)
      .input("position", sql.VarChar, position)
      .input("teamUUID", sql.UniqueIdentifier, teamID)
      .input("isActive", sql.Bit, isActive)
      .input("isForSale", sql.Bit, isForSale)
      .input("price", sql.Decimal(10, 2), price)
      .input("height", sql.Int, height)
      .input("speed", sql.Int, speed)
      .input("shooting", sql.Int, shooting)
      .input("playerImage", sql.VarChar(sql.MAX), imageBase64)
      .query(query);
      
    res.status(201).send({ message: "Jugador creat correctament." });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
};

export const getPlayers = async (req, res) => {
  try {
    const pool = await connectDb();
    const result = await pool.request().query(`
      SELECT p.*, t.TeamName 
      FROM Players p
      LEFT JOIN Teams t ON p.TeamUUID = t.TeamUUID
    `);
    res.status(200).json(result.recordset);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
};

export const deletePlayer = async (req, res) => {
  const playerId = req.params.id;

  try {
    const pool = await connectDb();
    await pool
      .request()
      .input("playerId", sql.UniqueIdentifier, playerId)
      .query("DELETE FROM Players WHERE PlayerUUID = @playerId");
    res.status(200).send({ message: "Jugador eliminat correctament." });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
};

export const getPlayersForSale = async (req, res) => {
  try {
    const pool = await connectDb();
    let query = `
      SELECT * FROM Players 
      WHERE IsForSale = 1 AND ReserveUserID IS NULL
    `;

    const { search, minPrice, maxPrice } = req.query;

    if (search) {
      query += " AND PlayerName LIKE @search";
    }
    if (minPrice) {
      query += " AND Price >= @minPrice";
    }
    if (maxPrice) {
      query += " AND Price <= @maxPrice";
    }

    const request = pool.request();
    if (search) {
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

export const buyPlayer = async (req, res) => {
  const playerId = req.params.id;
  const { userID } = req.body;

  if (!userID) {
    return res.status(400).send({ error: "Falta el userID del comprador." });
  }

  try {
    const pool = await connectDb();
    const result = await pool
      .request()
      .input("playerId", sql.UniqueIdentifier, playerId)
      .query("SELECT * FROM Players WHERE PlayerUUID = @playerId AND ReserveUserUUID IS NULL");

    if (result.recordset.length === 0) {
      return res.status(400).send({ error: "Aquest jugador no està disponible per a la compra." });
    }

    const coinsResult = await pool
      .request()
      .input("userID", sql.UniqueIdentifier, userID)
      .query("SELECT Footcoins FROM Users WHERE UserUUID = @userID");
    if (coinsResult.recordset.length === 0) {
      return res.status(404).send({ error: "Usuari no trobat." });
    }
    const currentCoins = coinsResult.recordset[0].Footcoins;
    const playerPrice = result.recordset[0].Price;
    if (currentCoins < playerPrice) {
      return res.status(400).send({ error: "No tens diners suficients per comprar aquest jugador." });
    }

    await pool
      .request()
      .input("playerId", sql.UniqueIdentifier, playerId)
      .input("userID", sql.UniqueIdentifier, userID)
      .query(`
        UPDATE Players 
        SET ReserveUserUUID = @userID,
            IsForSale = 0
        WHERE PlayerUUID = @playerId
      `);

    await pool
      .request()
      .input("userID", sql.UniqueIdentifier, userID)
      .input("amount", sql.Decimal(18,2), -playerPrice)
      .query("UPDATE Users SET Footcoins = Footcoins + @amount WHERE UserUUID = @userID");

    res.status(200).send({ message: "Jugador comprat i afegit a la reserva correctament." });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
};
