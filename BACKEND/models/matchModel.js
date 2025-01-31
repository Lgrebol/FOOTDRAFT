import Match from "./Match.js"; // Ruta relativa correcta

// Crear un partit
export const createMatch = async (homeTeamId, awayTeamId, tournamentId, matchDate) => {
  const newMatch = new Match({
    homeTeamId,
    awayTeamId,
    tournamentId,
    matchDate,
    status: "pending", // Estat del partit (pot ser "pending", "in-progress", "completed")
  });

  await newMatch.save();
};

// Obtenir els partits per torneig
export const getMatchesByTournament = async (tournamentId) => {
  return await Match.find({ tournamentId }).exec(); // Trobar partits per ID de torneig
};

// Actualitzar el resultat d'un partit
export const updateMatchResult = async (matchId, homeGoals, awayGoals) => {
  const match = await Match.findById(matchId);

  if (!match) {
    throw new Error("Partit no trobat");
  }

  match.homeGoals = homeGoals;
  match.awayGoals = awayGoals;
  match.status = "completed"; // Actualitzar l'estat del partit a completat

  await match.save();
};
