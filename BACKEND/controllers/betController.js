// controllers/betController.js
import { createBet, getUserFootcoins, updateUserFootcoins, getBetsByMatch, updateBetStatus } from "../models/betModel.js";

export const placeBetController = async (req, res) => {
  const { userID, matchID, amount, predictedWinner } = req.body;
  if (!userID || !matchID || !amount || !predictedWinner) {
    return res.status(400).send({ error: "Falten camps obligatoris." });
  }
  
  try {
    // Comprovem si l'usuari disposa de suficients footcoins
    const userCoins = await getUserFootcoins(userID);
    if (userCoins < amount) {
      return res.status(400).send({ error: "Footcoins insuficients." });
    }
    
    // Dedueix immediatament la quantitat apostada
    await updateUserFootcoins(userID, -amount);
    
    // Registra l'aposta
    const betID = await createBet(userID, matchID, amount, predictedWinner);
    
    res.status(201).json({ message: "Aposta realitzada correctament.", betID, newBalance: userCoins - amount });
  } catch (error) {
    console.error("Error en realitzar l'aposta:", error);
    res.status(500).json({ error: "Error en realitzar l'aposta." });
  }
};

// Funció per resoldre totes les apostes d'un partit donat
// winningTeam pot ser "home", "away" o "draw"
export const resolveBetsForMatch = async (matchID, winningTeam) => {
  try {
    const bets = await getBetsByMatch(matchID);
    for (const bet of bets) {
      // Només resolem les apostes pendents
      if (bet.Status !== 'pending') continue;
      
      // En cas d'empate, reemborsar la quantitat apostada
      if (winningTeam.toLowerCase() === 'draw') {
        await updateUserFootcoins(bet.UserID, bet.Amount);
        await updateBetStatus(bet.BetID, 'refunded', bet.Amount);
      }
      // Si l'aposta és encertada
      else if (bet.PredictedWinner.toLowerCase() === winningTeam.toLowerCase()) {
        // Guany: 4 vegades la quantitat apostada
        const winnings = bet.Amount * 4;
        await updateUserFootcoins(bet.UserID, winnings);
        await updateBetStatus(bet.BetID, 'won', winnings);
      }
      // Si l'aposta és errònia, ja s'ha deduït la quantitat
      else {
        await updateBetStatus(bet.BetID, 'lost', 0);
      }
    }
    return true;
  } catch (error) {
    console.error("Error en resoldre les apostes:", error);
    throw error;
  }
};
