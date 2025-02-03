// controllers/matchController.js
import {
  createMatch,
  getMatchById,
  addMatchEvent,
  getMatchEvents,
  updateMatchScore,
  updatePlayerStatistics,
  resetMatchData  // funció que implementarem per resetear partida
} from "../models/matchModel.js";
import sql from "mssql";
import connectDb from "../config/db.js";

/**
 * Crea una partida nova.
 * Requereix al cos de la petició:
 *  - tournamentID: ID del torneig.
 *  - homeTeamID: ID de l'equip local.
 *  - awayTeamID: ID de l'equip visitant.
 *  - matchDate: Data i hora de la partida.
 */
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

/**
 * Retorna la informació d'una partida (marcador i esdeveniments).
 * Requereix:
 *  - id: l'ID de la partida (per URL).
 */
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

/**
 * Inicia la simulació automàtica d'una partida.
 * L'endpoint rep al cos el camp:
 *   - matchID: ID de la partida a simular.
 * 
 * La simulació recorre 90 "minuts" (1 minut = 500ms) i, en cada minut, amb una probabilitat definida,
 * s'afegeix un esdeveniment (per aquest exemple, només es simula el gol).
 * Es registra l'esdeveniment, s'actualitza el marcador i les estadístiques.
 */
export const startMatchSimulationController = async (req, res) => {
  const { matchID } = req.body;
  if (!matchID) return res.status(400).send({ error: "Falta el camp matchID." });
  try {
    // Obtenim la partida i validem que existeix
    const match = await getMatchById(matchID);
    if (!match) return res.status(404).send({ error: "Partida no trobada." });

    // Obtenim els jugadors de cada equip
    const pool = await connectDb();
    const homePlayersResult = await pool
      .request()
      .input("teamID", sql.Int, match.HomeTeamID)
      .query("SELECT PlayerID, PlayerName FROM Players WHERE TeamID = @teamID AND IsActive = 1");
    const awayPlayersResult = await pool
      .request()
      .input("teamID", sql.Int, match.AwayTeamID)
      .query("SELECT PlayerID, PlayerName FROM Players WHERE TeamID = @teamID AND IsActive = 1");

    const homePlayers = homePlayersResult.recordset;
    const awayPlayers = awayPlayersResult.recordset;

    // Inicialitzem el marcador
    let homeGoals = 0;
    let awayGoals = 0;

    // Simulem 90 minuts. (1 minut = 500ms)
    for (let minute = 1; minute <= 90; minute++) {
      await new Promise(resolve => setTimeout(resolve, 500));

      // Determinem amb una probabilitat del 20% que hi hagi un esdeveniment (aquest percentatge es pot ajustar)
      if (Math.random() < 0.2) {
        const eventType = "Goal";

        // Escollim aleatòriament quin equip anota
        const teamChoice = Math.random() < 0.5 ? "home" : "away";
        let player;
        if (teamChoice === "home" && homePlayers.length > 0) {
          player = homePlayers[Math.floor(Math.random() * homePlayers.length)];
          homeGoals++;
        } else if (teamChoice === "away" && awayPlayers.length > 0) {
          player = awayPlayers[Math.floor(Math.random() * awayPlayers.length)];
          awayGoals++;
        }
        if (player) {
          const description = `${player.PlayerName} ha marcat per al ${teamChoice === "home" ? "equip local" : "equip visitant"} al minut ${minute}`;
          await addMatchEvent(matchID, player.PlayerID, eventType, minute, description);
          await updateMatchScore(matchID, homeGoals, awayGoals);
          await updatePlayerStatistics(player.PlayerID, 1, 0, 0, 0);
        }
      }
      // Aquí podries afegir altres tipus d'esdeveniments si ho desitges
    }

    // Un cop finalitzada la simulació, obtenim tots els esdeveniments registrats
    const events = await getMatchEvents(matchID);

    // Obtenim els noms dels equips per completar el resum
    const homeTeamResult = await pool
      .request()
      .input("teamID", sql.Int, match.HomeTeamID)
      .query("SELECT TeamName FROM Teams WHERE TeamID = @teamID");
    const awayTeamResult = await pool
      .request()
      .input("teamID", sql.Int, match.AwayTeamID)
      .query("SELECT TeamName FROM Teams WHERE TeamID = @teamID");

    const summary = {
      match: { ...match, HomeGoals: homeGoals, AwayGoals: awayGoals },
      homeTeam: homeTeamResult.recordset[0].TeamName,
      awayTeam: awayTeamResult.recordset[0].TeamName,
      events
    };

    res.status(200).json(summary);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
};

/**
 * Reinicia una partida: elimina els esdeveniments associats i reinicia el marcador.
 * Requereix:
 *   - matchID (al cos de la petició)
 */
export const resetMatchController = async (req, res) => {
  const { matchID } = req.body;
  if (!matchID) return res.status(400).send({ error: "Falta el camp matchID." });
  try {
    // Reinicia les dades del match a la base de dades (funció que has d'implementar al model)
    await resetMatchData(matchID);
    res.status(200).send({ message: "Partida reiniciada correctament." });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
};
