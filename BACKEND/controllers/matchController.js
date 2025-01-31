import { createMatch, getMatchesByTournament, updateMatchResult } from "../models/matchModel.js";

// Crear un partit
export const createMatchController = async (req, res) => {
  const { homeTeamId, awayTeamId, tournamentId, matchDate } = req.body;

  // Comprovem que tots els camps obligatoris estan presents
  if (!homeTeamId || !awayTeamId || !tournamentId || !matchDate) {
    return res.status(400).send({ error: "Falten camps obligatoris." });
  }

  try {
    // Creem el partit
    await createMatch(homeTeamId, awayTeamId, tournamentId, matchDate);
    res.status(201).send({ message: "Partit creat correctament." });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
};

// Obtenir els partits d'un torneig
export const getMatchesController = async (req, res) => {
  const { tournamentId } = req.params;

  try {
    // Obtenim els partits del torneig
    const matches = await getMatchesByTournament(tournamentId);
    res.status(200).json(matches);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
};

// Actualitzar el resultat d'un partit
export const updateMatchResultController = async (req, res) => {
  const { matchId, homeGoals, awayGoals } = req.body;

  try {
    // Actualitzem el resultat del partit
    await updateMatchResult(matchId, homeGoals, awayGoals);
    res.status(200).send({ message: "Resultat del partit actualitzat correctament." });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
};
