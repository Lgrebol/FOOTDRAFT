import {
  createMatch,
  getMatchById,
  addMatchEvent,
  getMatchEvents,
  updateMatchScore,
  updatePlayerStatistics
} from "../models/matchModel.js";
import sql from "mssql";
import connectDb from "../config/db.js";

export const createMatchController = async (req, res) => {
  const { tournamentID, homeTeamID, awayTeamID, matchDate } = req.body;
  if (!tournamentID || !homeTeamID || !awayTeamID || !matchDate) {
    return res.status(400).send({ error: "Falten camps obligatoris." });
  }
  try {
    const matchID = await createMatch(tournamentID, homeTeamID, awayTeamID, matchDate);
    res.status(201).send({ message: "Partida creada correctament.", matchID });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
};

export const getMatchController = async (req, res) => {
  const { id } = req.params;
  try {
    const match = await getMatchById(id);
    const events = await getMatchEvents(id);
    res.status(200).json({ match, events });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
};

export const simulateMatchEventController = async (req, res) => {
  const { matchID, playerID, minute, eventType } = req.body;
  if (!matchID || !playerID || minute === undefined || !eventType) {
    return res.status(400).send({ error: "Falten camps obligatoris." });
  }
  try {
    // Obtenir informació del jugador (nom i equip)
    const pool = await connectDb();
    const playerResult = await pool.request()
      .input("playerID", sql.Int, playerID)
      .query("SELECT PlayerName, TeamID FROM Players WHERE PlayerID = @playerID");
    if (!playerResult.recordset.length) {
      return res.status(404).send({ error: "Jugador no trobat." });
    }
    const { PlayerName, TeamID } = playerResult.recordset[0];

    // Obtenir el nom de l'equip
    const teamResult = await pool.request()
      .input("teamID", sql.Int, TeamID)
      .query("SELECT TeamName FROM Teams WHERE TeamID = @teamID");
    const teamName = teamResult.recordset[0].TeamName;

    // Crear una descripció per l'esdeveniment
    let description = `${PlayerName} del ${teamName}`;
    if (eventType === 'Goal') {
      description += ` ha marcat un gol al minut ${minute}`;
    } else if (eventType === 'Assist') {
      description += ` ha donat una assistència al minut ${minute}`;
    } else if (eventType === 'YellowCard') {
      description += ` ha rebut una targeta groga al minut ${minute}`;
    } else if (eventType === 'RedCard') {
      description += ` ha rebut una targeta vermella al minut ${minute}`;
    } else if (eventType === 'Substitution') {
      description += ` s'ha substituït al minut ${minute}`;
    }

    // Inserir l'esdeveniment a la taula MatchEvents
    await addMatchEvent(matchID, playerID, eventType, minute, description);

    // Si és un gol, actualitzar marcador i estadístiques
    if (eventType === 'Goal') {
      const match = await getMatchById(matchID);
      let newHomeGoals = match.HomeGoals;
      let newAwayGoals = match.AwayGoals;

      // Comprovar si l'equip del jugador és local o visitant i actualitzar en conseqüència
      if (TeamID === match.HomeTeamID) {
        newHomeGoals += 1;
      } else if (TeamID === match.AwayTeamID) {
        newAwayGoals += 1;
      }
      await updateMatchScore(matchID, newHomeGoals, newAwayGoals);
      await updatePlayerStatistics(playerID, 1, 0, 0, 0);
    }

    res.status(200).send({ message: "Esdeveniment registrat.", description });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
};

export const matchSummaryController = async (req, res) => {
  const { matchID } = req.params;
  try {
    const match = await getMatchById(matchID);
    const events = await getMatchEvents(matchID);

    // Obtenir els noms dels equips
    const pool = await connectDb();
    const homeTeamResult = await pool.request()
      .input("teamID", sql.Int, match.HomeTeamID)
      .query("SELECT TeamName FROM Teams WHERE TeamID = @teamID");
    const awayTeamResult = await pool.request()
      .input("teamID", sql.Int, match.AwayTeamID)
      .query("SELECT TeamName FROM Teams WHERE TeamID = @teamID");

    const summary = {
      match,
      homeTeam: homeTeamResult.recordset[0].TeamName,
      awayTeam: awayTeamResult.recordset[0].TeamName,
      events
    };

    res.status(200).json(summary);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
};
