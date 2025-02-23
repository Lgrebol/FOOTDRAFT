import connectDb from "../config/db.js";
import sql from "mssql";
import jwt from "jsonwebtoken";
import { 
  getBetsByMatch, 
  updateBetStatus, 
  updateUserFootcoins, 
  createBet, 
  getUserFootcoins 
} from "../models/betModel.js";

export const getCurrentUser = async (req, res) => {
  try {
    const userUUID = req.user.userUUID; 
    const pool = await connectDb();
    const result = await pool
      .request()
      .input("userUUID", sql.UniqueIdentifier, userUUID)
      .query(`
        SELECT UserUUID, Name, Email, Footcoins 
        FROM Users 
        WHERE UserUUID = @userUUID
      `);
    if (result.recordset.length === 0) {
      return res.status(404).json({ error: "Usuari no trobat" });
    }
    const userData = result.recordset[0];
    res.json({
      userUUID: userData.UserUUID,
      name: userData.Name,
      email: userData.Email,
      footcoins: userData.Footcoins
    });
  } catch (error) {
    console.error("Error obtenint l'usuari:", error);
    res.status(500).json({ error: "Error obtenint l'usuari" });
  }
};

export const loginUsers = async (req, res) => {
  try {
    const { email, password } = req.body;
    const pool = await connectDb();
    const result = await pool.request()
      .input('email', sql.VarChar, email)
      .query('SELECT * FROM Users WHERE Email = @email');
    if (result.recordset.length === 0) {
      return res.status(401).json({ error: "Credencials invàlides" });
    }
    const user = result.recordset[0];
    const token = jwt.sign(
      {
        userUUID: user.UserUUID,
        email: user.Email,
        footcoins: user.Footcoins
      },
      process.env.JWT_SECRET,
      { expiresIn: '10h' }
    );
    res.status(200).json({ 
      token, 
      footcoins: user.Footcoins 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const resolveBetsForMatch = async (matchUUID, winningTeam) => {
  try {
    const bets = await getBetsByMatch(matchUUID);
    console.log(`Resolent apostes per al partit: ${matchUUID} | Guanyador: ${winningTeam}`);
    for (const bet of bets) {
      if (bet.Status !== 'pending') continue;
      if (winningTeam.toLowerCase() === 'draw') {
        console.log(`EMPAT! L'usuari ${bet.UserUUID} perd ${bet.Amount} Footcoins.`);
        await updateBetStatus(bet.BetUUID, 'lost', 0);
      } else if (bet.PredictedWinner.toLowerCase() === winningTeam.toLowerCase()) {
        const winnings = bet.Amount * 4;
        console.log(`VICTÒRIA! +${winnings} Footcoins per a l'usuari ${bet.UserUUID}`);
        await updateUserFootcoins(bet.UserUUID, winnings);
        await updateBetStatus(bet.BetUUID, 'won', winnings);
      } else {
        console.log(`DERROTA. L'usuari ${bet.UserUUID} perd ${bet.Amount} Footcoins.`);
        await updateBetStatus(bet.BetUUID, 'lost', 0);
      }
    }
    return true;
  } catch (error) {
    console.error("Error resolent apostes:", error);
    throw error;
  }
};

export const placeBetController = async (req, res) => {
  const { matchUUID, homeTeamUUID, awayTeamUUID, amount, predictedWinner } = req.body;
  const userUUID = req.user.userUUID;
  if (!userUUID || !amount || !predictedWinner || (!matchUUID && (!homeTeamUUID || !awayTeamUUID))) {
    return res.status(400).send({ error: "Falten camps obligatoris." });
  }
  try {
    const userCoins = await getUserFootcoins(userUUID);
    if (userCoins < amount) {
      return res.status(400).send({ error: "Footcoins insuficients." });
    }
    await updateUserFootcoins(userUUID, -amount);
    const betUUID = await createBet(
      userUUID,
      matchUUID || null,
      amount,
      predictedWinner,
      homeTeamUUID,
      awayTeamUUID
    );
    res.status(201).json({
      message: "Aposta realitzada correctament.",
      betUUID,
      newBalance: userCoins - amount
    });
  } catch (error) {
    console.error("Error en realitzar l'aposta:", error);
    res.status(500).json({ error: "Error en realitzar l'aposta." });
  }
};
