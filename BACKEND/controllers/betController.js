import { createBet, getUserFootcoins, updateUserFootcoins, getBetsByMatch, updateBetStatus } from "../models/betModel.js";
export const placeBetController = async (req, res) => {
  // Extraiem la resta de camps del body
  const { matchID, homeTeamID, awayTeamID, amount, predictedWinner } = req.body;
  // Obtenim l'usuari a partir del token (assignat per authMiddleware)
  const userID = req.user.userId;

  // Validació de camps obligatoris
  if (
    !userID ||
    userID <= 0 ||
    (!matchID && (!homeTeamID || !awayTeamID)) ||
    !amount ||
    !predictedWinner
  ) {
    return res.status(400).send({ error: "Falten camps obligatoris." });
  }

  try {
    // Comprovem si l'usuari té suficients footcoins
    const userCoins = await getUserFootcoins(userID);
    if (userCoins < amount) {
      return res.status(400).send({ error: "Footcoins insuficients." });
    }

    // Dedueix immediatament la quantitat apostada
    await updateUserFootcoins(userID, -amount);

    // Crea l'aposta (matchID pot ser null si s'aposta per equips)
    const betID = await createBet(userID, matchID || null, amount, predictedWinner, homeTeamID, awayTeamID);

    res.status(201).json({ message: "Aposta realitzada correctament.", betID, newBalance: userCoins - amount });
  } catch (error) {
    console.error("Error en realitzar l'aposta:", error);
    res.status(500).json({ error: "Error en realitzar l'aposta." });
  }
};

// Funció per resoldre les apostes d'un partit
export const resolveBetsForMatch = async (matchID, winningTeam) => {
  try {
    const bets = await getBetsByMatch(matchID);
    console.log(`Resolent apostes per al partit: ${matchID} | Equip guanyador: ${winningTeam}`);

    for (const bet of bets) {
      if (bet.Status !== 'pending') continue;

      console.log(`Processant aposta ${bet.BetID} | Usuari: ${bet.UserID} | Quantitat: ${bet.Amount}`);

      if (winningTeam.toLowerCase() === 'draw') {
        // Empat: l'usuari perd l'aposta
        console.log(`Empat detectat: Aposta perduda per l'usuari ${bet.UserID}`);
        await updateBetStatus(bet.BetID, 'lost', 0);
      } else if (bet.PredictedWinner.toLowerCase() === winningTeam.toLowerCase()) {
        // Guanya: suma 4x l'aposta
        const winnings = bet.Amount * 4; // Math.abs no és necessari si Amount és positiu
        console.log(`APOSTA GUANYADA! Afegint ${winnings} a l'usuari ${bet.UserID}`);
        await updateUserFootcoins(bet.UserID, winnings);
        await updateBetStatus(bet.BetID, 'won', winnings);
      } else {
        // Perd: no es fa res
        console.log(`Aposta perduda per l'usuari ${bet.UserID}`);
        await updateBetStatus(bet.BetID, 'lost', 0);
      }
    }
    return true;
  } catch (error) {
    console.error("Error resolent les apostes:", error);
    throw error;
  }
};