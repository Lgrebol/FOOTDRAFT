import {
  createMatch,
  getMatchById,
  addMatchEvent,
  getMatchEvents,
  updateMatchScore,
  updatePlayerStatistics,
  resetMatchData
} from "../models/matchModel.js";
import { resolveBetsForMatch } from "../controllers/betController.js"; // Importem la funció per resoldre apostes
import sql from "mssql";
import connectDb from "../config/db.js";

export const startMatchSimulationController = async (req, res) => {
  const { matchID } = req.body;
  if (!matchID) return res.status(400).send({ error: "Falta el camp matchID." });
  try {
    // Obtenim la partida i validem que existeix
    const match = await getMatchById(matchID);
    if (!match) return res.status(404).send({ error: "Partida no trobada." });

    const pool = await connectDb();

    // Obtenim els jugadors de cada equip
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

    // Comprovem que cada equip té exactament 5 jugadors
    if (homePlayers.length !== 5) {
      return res.status(400).json({ error: "L'equip local ha de tenir exactament 5 jugadors actius." });
    }
    if (awayPlayers.length !== 5) {
      return res.status(400).json({ error: "L'equip visitant ha de tenir exactament 5 jugadors actius." });
    }

    // Inicialitzem el marcador
    let homeGoals = 0;
    let awayGoals = 0;

    // Simulem 90 minuts (1 minut = 500ms)
    for (let minute = 1; minute <= 90; minute++) {
      await new Promise(resolve => setTimeout(resolve, 500));
      if (Math.random() < 0.3) {
        const eventChance = Math.random();
        let eventType;
        if (eventChance < 0.5) {
          eventType = "Goal";
        } else if (eventChance < 0.8) {
          eventType = "Falta";
        } else {
          eventType = "Vermella";
        }
        const teamChoice = Math.random() < 0.5 ? "home" : "away";
        let player;
        if (teamChoice === "home" && homePlayers.length > 0) {
          player = homePlayers[Math.floor(Math.random() * homePlayers.length)];
        } else if (teamChoice === "away" && awayPlayers.length > 0) {
          player = awayPlayers[Math.floor(Math.random() * awayPlayers.length)];
        }
        if (player) {
          let description = "";
          if (eventType === "Goal") {
            if (teamChoice === "home") {
              homeGoals++;
            } else {
              awayGoals++;
            }
            // Cal usar backticks per als template literals
            description = `${player.PlayerName} ha marcat per a l'${teamChoice === "home" ? "equip local" : "equip visitant"} al minut ${minute}`;
            await updatePlayerStatistics(player.PlayerID, 1, 0, 0, 0);
          } else if (eventType === "Falta") {
            description = `${player.PlayerName} ha comès una falta per a l'${teamChoice === "home" ? "equip local" : "equip visitant"} al minut ${minute}`;
          } else if (eventType === "Vermella") {
            description = `${player.PlayerName} ha rebut una targeta vermella per a l'${teamChoice === "home" ? "equip local" : "equip visitant"} al minut ${minute}`;
            await updatePlayerStatistics(player.PlayerID, 0, 0, 0, 1);
          }
          await addMatchEvent(matchID, player.PlayerID, eventType, minute, description);
          await updateMatchScore(matchID, homeGoals, awayGoals);
        }
      }
    }

    // Obtenim tots els esdeveniments registrats i els noms dels equips...
    // (El codi existent per completar el resum del partit)
    
    // Determinació del guanyador i resolució de les apostes
    let winningTeam = "draw";
    if (homeGoals > awayGoals) {
      winningTeam = "home";
    } else if (awayGoals > homeGoals) {
      winningTeam = "away";
    }
    await resolveBetsForMatch(matchID, winningTeam);

    // Resum final
    // ... (codi existent)
    res.status(200).json(summary);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
};


export const createMatchController = async (req, res) => {
  try {
    const { tournamentID, homeTeamID, awayTeamID, matchDate } = req.body;
    const matchID = await createMatch(tournamentID, homeTeamID, awayTeamID, matchDate);
    res.status(201).json({ matchID });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
};

export const getMatchController = async (req, res) => {
  try {
    const { matchID } = req.params; // Ara extrau el paràmetre 'matchID'
    const match = await getMatchById(matchID);
    if (!match) return res.status(404).send({ error: "Partida no trobada" });
    res.status(200).json({ match });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
};

export const resetMatchController = async (req, res) => {
  const { matchID } = req.body;
  if (!matchID) return res.status(400).send({ error: "Falta el camp matchID." });

  try {
    await resetMatchData(matchID); // Funció que ja està definida a matchModel.js
    res.status(200).json({ message: "Dades del partit reiniciades correctament." });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
};
