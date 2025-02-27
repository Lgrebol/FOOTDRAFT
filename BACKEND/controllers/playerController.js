import sql from "mssql";
import connectDb from "../config/db.js";
import { validationResult, body } from "express-validator";

const isValidUUID = (uuid) => {
  const uuidRegex = /^[{}]?[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}[{}]?$/i;
  return uuidRegex.test(uuid);
};

export const validateCreatePlayer = [
  body("playerName")
    .notEmpty().withMessage("El nom del jugador és obligatori"),
  body("position")
    .notEmpty().withMessage("La posició és obligatòria"),
  body("teamID")
    .notEmpty().withMessage("L'identificador de l'equip és obligatori")
    .isUUID().withMessage("teamID ha de ser un UUID vàlid"),
  body("isActive")
    .optional().isBoolean().withMessage("isActive ha de ser booleà"),
  body("isForSale")
    .optional().isBoolean().withMessage("isForSale ha de ser booleà"),
  body("price")
    .optional().isFloat({ min: 0 }).withMessage("El preu ha de ser un número positiu"),
  body("height")
    .optional().isInt({ min: 0 }).withMessage("L'altura ha de ser un enter positiu"),
  body("speed")
    .optional().isInt({ min: 0 }).withMessage("La velocitat ha de ser un enter positiu"),
  body("shooting")
    .optional().isInt({ min: 0 }).withMessage("La potència de tir ha de ser un enter positiu"),
];

export const createPlayer = async (req, res) => {
  // Validem els camps rebuts
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array() });
  }

  // Comprovem que s'ha pujat una imatge
  if (!req.file) {
    return res.status(400).send({ error: "Cal pujar una imatge." });
  }

  const { playerName, position, teamID, isActive, isForSale, price, height, speed, shooting } = req.body;
  const imageBase64 = req.file.buffer.toString('base64');

  let pool;
  try {
    pool = await connectDb();
    const query = `
      INSERT INTO Players (
        PlayerName, Position, TeamUUID, IsActive, 
        IsForSale, Price, Height, Speed, Shooting, PlayerImage
      )
      OUTPUT INSERTED.PlayerUUID, INSERTED.PlayerName, INSERTED.Position, INSERTED.TeamUUID, 
             INSERTED.IsActive, INSERTED.IsForSale, INSERTED.Price, INSERTED.Height, 
             INSERTED.Speed, INSERTED.Shooting, INSERTED.PlayerImage
      VALUES (
        @playerName, @position, @teamUUID, 
        @isActive, @isForSale, @price, @height, 
        @speed, @shooting, @playerImage
      )
    `;
    
    const result = await pool.request()
      .input("playerName", sql.VarChar, playerName)
      .input("position", sql.VarChar, position)
      .input("teamUUID", sql.UniqueIdentifier, teamID)
      .input("isActive", sql.Bit, isActive === '1' || isActive === true ? 1 : 0)
      .input("isForSale", sql.Bit, isForSale === '1' || isForSale === true ? 1 : 0)
      .input("price", sql.Decimal(10, 2), parseFloat(price))
      .input("height", sql.Int, parseInt(height))
      .input("speed", sql.Int, parseInt(speed))
      .input("shooting", sql.Int, parseInt(shooting))
      .input("playerImage", sql.VarChar(sql.MAX), imageBase64)
      .query(query);

    const insertedPlayer = result.recordset[0];
    res.status(201).send(insertedPlayer);
  } catch (err) {
    if (err.message && (err.message.includes("overflow") || err.message.includes("Arithmetic overflow"))) {
      return res.status(400).send({ error: "Preu del jugador excedit" });
    }
    res.status(500).send({ 
      error: "Error al crear jugador",
      detalls: err.message,
      query: err.query 
    });
  } finally {
    if (pool) pool.close();
  }
};

export const getPlayers = async (req, res) => {
  let pool;
  try {
    pool = await connectDb();
    const result = await pool.request().query(`
      SELECT p.*, t.TeamName 
      FROM Players p
      INNER JOIN Teams t ON p.TeamUUID = t.TeamUUID
    `);
    res.status(200).json(result.recordset);
  } catch (err) {
    res.status(500).send({ error: err.message });
  } finally {
    if (pool) pool.close();
  }
};

export const deletePlayer = async (req, res) => {
  const playerId = req.params.id;

  if (!isValidUUID(playerId)) {
    return res.status(400).send({ error: "ID de jugador invàlid" });
  }

  let pool;
  try {
    pool = await connectDb();
    await pool
      .request()
      .input("playerId", sql.UniqueIdentifier, playerId)
      .query("DELETE FROM Players WHERE PlayerUUID = @playerId");
    res.status(200).send({ message: "Jugador eliminat correctament." });
  } catch (err) {
    res.status(500).send({ error: err.message });
  } finally {
    if (pool) pool.close();
  }
};

export const updatePlayer = async (req, res) => {
  const playerId = req.params.id;
  const { playerName, position, teamID, isActive, isForSale, price, height, speed, shooting } = req.body;

  if (!playerName?.trim() || !position?.trim() || !teamID?.trim()) {
    return res.status(400).send({ error: "Falten camps obligatoris." });
  }

  let imageBase64 = null;
  if (req.file) {
    imageBase64 = req.file.buffer.toString('base64');
  }

  let pool;
  try {
    pool = await connectDb();
    let query = `
      UPDATE Players
      SET PlayerName = @playerName,
          Position = @position,
          TeamUUID = @teamUUID,
          IsActive = @isActive,
          IsForSale = @isForSale,
          Price = @price,
          Height = @height,
          Speed = @speed,
          Shooting = @shooting`;
    if (imageBase64) {
      query += `,
          PlayerImage = @playerImage`;
    }
    query += `
      WHERE PlayerUUID = @playerId;
      SELECT p.*, t.TeamName FROM Players p
      INNER JOIN Teams t ON p.TeamUUID = t.TeamUUID
      WHERE p.PlayerUUID = @playerId;
    `;

    let request = pool.request();
    request.input("playerId", sql.UniqueIdentifier, playerId);
    request.input("playerName", sql.VarChar, playerName);
    request.input("position", sql.VarChar, position);
    request.input("teamUUID", sql.UniqueIdentifier, teamID);
    request.input("isActive", sql.Bit, isActive === '1' || isActive === true ? 1 : 0);
    request.input("isForSale", sql.Bit, isForSale === '1' || isForSale === true ? 1 : 0);
    request.input("price", sql.Decimal(10, 2), parseFloat(price));
    request.input("height", sql.Int, parseInt(height));
    request.input("speed", sql.Int, parseInt(speed));
    request.input("shooting", sql.Int, parseInt(shooting));
    if (imageBase64) {
      request.input("playerImage", sql.VarChar(sql.MAX), imageBase64);
    }

    const result = await request.query(query);
    const updatedPlayer = result.recordset[0];
    res.status(200).send(updatedPlayer);
  } catch (err) {
    res.status(500).send({
      error: "Error al actualitzar el jugador",
      detalls: err.message,
    });
  } finally {
    if (pool) pool.close();
  }
};

export const getPlayersForSale = async (req, res) => {
  let pool;
  try {
    pool = await connectDb();
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
  } finally {
    if (pool) pool.close();
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

  let pool;
  try {
    pool = await connectDb();
    
    // Verificar disponibilitat del jugador
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

    // Verificar saldo de l'usuari
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
        .input("amount", sql.Decimal(18, 2), -playerPrice)
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
  } finally {
    if (pool) pool.close();
  }
};
