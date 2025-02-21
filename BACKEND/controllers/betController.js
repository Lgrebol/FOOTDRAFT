import connectDb from "../config/db.js";
import sql from "mssql";
import jwt from "jsonwebtoken";

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

export const resolveBetsForMatch = async (matchID, winningTeam) => {
  try {
    const bets = await getBetsByMatch(matchID);
    console.log(`Resolent apostes per al partit: ${matchID} | Guanyador: ${winningTeam}`);

    for (const bet of bets) {
      if (bet.Status !== 'pending') continue;

      if (winningTeam.toLowerCase() === 'draw') {
        console.log(`EMPAT! L'usuari ${bet.UserUUID} perd ${bet.Amount} Footcoins.`);
        await updateBetStatus(bet.BetID, 'lost', 0);
      } else if (bet.PredictedWinner.toLowerCase() === winningTeam.toLowerCase()) {
        const winnings = bet.Amount * 4;
        console.log(`VICTÒRIA! +${winnings} Footcoins per a l'usuari ${bet.UserUUID}`);
        await updateUserFootcoins(bet.UserUUID, winnings);
        await updateBetStatus(bet.BetID, 'won', winnings);
      } else {
        console.log(`DERROTA. L'usuari ${bet.UserUUID} perd ${bet.Amount} Footcoins.`);
        await updateBetStatus(bet.BetID, 'lost', 0);
      }
    }
    return true;
  } catch (error) {
    console.error("Error resolent apostes:", error);
    throw error;
  }
};


export const placeBetController = async (req, res) => {
  // Extraiem els camps del body
  const { matchID, homeTeamID, awayTeamID, amount, predictedWinner } = req.body;
  // Ara obtenim el userUUID del token (ja que el middleware d'autenticació l'ha assignat a req.user)
  const userUUID = req.user.userUUID;

  // Validem que tots els camps obligatoris estiguin presents.
  // No cal validar amb "userUUID <= 0" perquè és una cadena (UUID)
  if (
    !userUUID ||
    (!matchID && (!homeTeamID || !awayTeamID)) ||
    !amount ||
    !predictedWinner
  ) {
    return res.status(400).send({ error: "Falten camps obligatoris." });
  }

  try {
    // Comprovem si l'usuari té suficients footcoins
    const userCoins = await getUserFootcoins(userUUID);
    if (userCoins < amount) {
      return res.status(400).send({ error: "Footcoins insuficients." });
    }

    // Dedueix immediatament la quantitat apostada
    await updateUserFootcoins(userUUID, -amount);

    // Crea l'aposta. Observeu que matchID, homeTeamID i awayTeamID són ara UUIDs
    const betID = await createBet(
      userUUID,
      matchID || null,
      amount,
      predictedWinner,
      homeTeamID,
      awayTeamID
    );

    res.status(201).json({
      message: "Aposta realitzada correctament.",
      betID,
      newBalance: userCoins - amount
    });
  } catch (error) {
    console.error("Error en realitzar l'aposta:", error);
    res.status(500).json({ error: "Error en realitzar l'aposta." });
  }
};
