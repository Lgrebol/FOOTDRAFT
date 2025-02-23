import sql from "mssql";
import connectDb from "../config/db.js";

const isValidUUID = (uuid) => {
  const uuidRegex = /^[{}]?[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}[{}]?$/i;
  return uuidRegex.test(uuid);
};

export const createPlayer = async (req, res) => {
  const { playerName, position, teamID, isActive, isForSale, price, height, speed, shooting } = req.body;
  
  if (!req.file) {
    return res.status(400).send({ error: "Cal pujar una imatge." });
  }

  const missingFields = [];
  if (!playerName?.trim()) missingFields.push('playerName');
  if (!position?.trim()) missingFields.push('position');
  if (!teamID?.trim()) missingFields.push('teamID');
  if (missingFields.length > 0) {
    return res.status(400).send({ 
      error: `Falten camps: ${missingFields.join(', ')}`,
      campsRebuts: req.body 
    });
  }

  const imageBase64 = req.file.buffer.toString('base64');

  try {
    const pool = await connectDb();
    const query = `
      INSERT INTO Players (
        PlayerName, Position, TeamUUID, IsActive, 
        IsForSale, Price, Height, Speed, Shooting, PlayerImage
      ) VALUES (
        @playerName, @position, @teamUUID, 
        @isActive, @isForSale, @price, @height, 
        @speed, @shooting, @playerImage
      )
    `;
    
    await pool.request()
      .input("playerName", sql.VarChar, playerName)
      .input("position", sql.VarChar, position)
      .input("teamUUID", sql.UniqueIdentifier, teamID)
      .input("isActive", sql.Bit, isActive === '1' ? 1 : 0)
      .input("isForSale", sql.Bit, isForSale === '1' ? 1 : 0)
      .input("price", sql.Decimal(10, 2), parseFloat(price))
      .input("height", sql.Int, parseInt(height))
      .input("speed", sql.Int, parseInt(speed))
      .input("shooting", sql.Int, parseInt(shooting))
      .input("playerImage", sql.VarChar(sql.MAX), imageBase64)
      .query(query);

    res.status(201).send({ message: "Jugador creat correctament." });
  } catch (err) {
    res.status(500).send({ 
      error: "Error al crear jugador",
      detalls: err.message,
      query: err.query 
    });
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

  if (!isValidUUID(playerId)) {
    return res.status(400).send({ error: "ID de jugador invàlid" });
  }

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
      WHERE IsForSale = 1 AND ReserveUserUUID IS NULL
    `;

    const { search, minPrice, maxPrice } = req.query;
    const request = pool.request();

    if (search) {
      query += " AND PlayerName LIKE @search";
      request.input("search", sql.VarChar, `%${search}%`);
    }
    if (minPrice) {
      query += " AND Price >= @minPrice";
      request.input("minPrice", sql.Decimal, minPrice);
    }
    if (maxPrice) {
      query += " AND Price <= @maxPrice";
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

  if (!isValidUUID(userID)) {
    return res.status(400).send({
      error: "ID usuari invàlid",
      exempleValid: "123e4567-e89b-12d3-a456-426614174000"
    });
  }

  if (!isValidUUID(playerId)) {
    return res.status(400).send({ error: "ID jugador invàlid" });
  }

  try {
    const pool = await connectDb();
    
    // Verificar disponibilitat jugador
    const playerResult = await pool.request()
      .input("playerId", sql.UniqueIdentifier, playerId)
      .query(`
        SELECT Price, ReserveUserUUID 
        FROM Players 
        WHERE PlayerUUID = @playerId
      `);

    if (playerResult.recordset.length === 0 || playerResult.recordset[0].ReserveUserUUID) {
      return res.status(400).send({ error: "Jugador no disponible" });
    }

    // Verificar saldo usuari
    const userResult = await pool.request()
      .input("userID", sql.UniqueIdentifier, userID)
      .query("SELECT Footcoins FROM Users WHERE UserUUID = @userID");

    if (userResult.recordset.length === 0) {
      return res.status(404).send({ error: "Usuari no trobat" });
    }

    const playerPrice = playerResult.recordset[0].Price;
    const userCoins = userResult.recordset[0].Footcoins;

    if (userCoins < playerPrice) {
      return res.status(400).send({ error: "Saldo insuficient" });
    }

    // Realitzar transacció
    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    try {
      await transaction.request()
        .input("playerId", sql.UniqueIdentifier, playerId)
        .input("userID", sql.UniqueIdentifier, userID)
        .query(`
          UPDATE Players 
          SET ReserveUserUUID = @userID, IsForSale = 0 
          WHERE PlayerUUID = @playerId
        `);

      await transaction.request()
        .input("userID", sql.UniqueIdentifier, userID)
        .input("amount", sql.Decimal(18,2), -playerPrice)
        .query("UPDATE Users SET Footcoins = Footcoins + @amount WHERE UserUUID = @userID");

      await transaction.commit();
      res.status(200).send({ message: "Compra realitzada amb èxit" });

    } catch (transactionError) {
      await transaction.rollback();
      throw transactionError;
    }

  } catch (err) {
    res.status(500).send({
      error: "Error en la transacció",
      detalls: err.message,
      codiError: err.code
    });
  }
};