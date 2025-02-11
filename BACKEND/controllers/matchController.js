import {
  createMatch,
  getMatchById,
  addMatchEvent,
  getMatchEvents,
  updateMatchScore,
  updatePlayerStatistics,
  resetMatchData
} from "../models/matchModel.js";
import { resolveBetsForMatch } from "../controllers/betController.js";
import sql from "mssql";
import connectDb from "../config/db.js";

// Funció per restablir els esdeveniments i el marcador del partit
export const resetMatchController = async (req, res) => {
  const { matchID } = req.body;
  if (!matchID) return res.status(400).send({ error: "Falta el camp matchID." });

  try {
    await resetMatchData(matchID); // Aquesta funció ha d'estar definida al teu model
    res.status(200).json({ message: "Dades del partit reiniciades correctament." });
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
// Funció per actualitzar el temps actual del partit (la columna CurrentMinute ha d'existir a la taula Matches)
export const updateMatchTime = async (matchID, currentMinute) => {
  const pool = await connectDb();
  await pool
    .request()
    .input("matchID", sql.Int, matchID)
    .input("currentMinute", sql.Int, currentMinute)
    .query("UPDATE Matches SET CurrentMinute = @currentMinute WHERE MatchID = @matchID");
};

// Actualitza el controlador per obtenir la partida amb els esdeveniments
export const getMatchController = async (req, res) => {
  try {
    const { matchID } = req.params; // si la ruta és /:matchID
    const match = await getMatchById(matchID);
    if (!match) return res.status(404).send({ error: "Partida no trobada" });

    // Obté els esdeveniments associats al partit
    const events = await getMatchEvents(matchID);
    match.events = events;
    res.status(200).json({ match });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
};

export const startMatchSimulationController = async (req, res) => {
  const { matchID } = req.body;
  if (!matchID) return res.status(400).send({ error: "Falta el camp matchID." });
  try {
    // Obtenim la partida
    const match = await getMatchById(matchID);
    if (!match) return res.status(404).send({ error: "Partida no trobada." });
    
    const pool = await connectDb();

    // Obtenim els jugadors actius dels dos equips
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

    if (homePlayers.length !== 5) {
      return res.status(400).json({ error: "L'equip local ha de tenir exactament 5 jugadors actius." });
    }
    if (awayPlayers.length !== 5) {
      return res.status(400).json({ error: "L'equip visitant ha de tenir exactament 5 jugadors actius." });
    }

    // Inicialització dels comptadors i de la llista d'esdeveniments
    let homeGoals = 0;
    let awayGoals = 0;
    let homeFouls = 0;
    let awayFouls = 0;
    let homeRedCards = 0;
    let awayRedCards = 0;
    let events = [];

    // Configuració de la durada de la simulació:
    // 90 minuts simulats en 30 segons → cada minut simulat dura aproximadament 333 ms
    const simulatedMinuteDuration = 333; 
    // Determina minuts afegits (entre 1 i 5)
    const extraMinutes = Math.floor(Math.random() * 5) + 1;

    // Simulació dels 90 minuts
    for (let minute = 1; minute <= 90; minute++) {
      // Actualitza el temps actual a la BD
      await updateMatchTime(matchID, minute);

      // Al minut 45, simula el break de mitja partida
      if (minute === 45) {
        const breakDescription = "Break de mitja partida";
        events.push({ minute, eventType: "Break", description: breakDescription });
        await addMatchEvent(matchID, 0, "Break", minute, breakDescription);
        // Pausa per 1 segon (1000 ms)
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Espera la durada del minut simulat
      await new Promise(resolve => setTimeout(resolve, simulatedMinuteDuration));

      // Amb 30% de probabilitat es genera un esdeveniment durant aquest minut
      if (Math.random() < 0.3) {
        // Per mantenir l'equilibri, si la diferència de gols és ≥2, es dóna prioritat a l'equip que va perdent
        let teamChoice = "home";
        if (Math.abs(homeGoals - awayGoals) >= 2) {
          teamChoice = homeGoals > awayGoals ? "away" : "home";
        } else {
          teamChoice = Math.random() < 0.5 ? "home" : "away";
        }
        // Amb un 10% de probabilitat, simula una "golejada" (2 gols d'un cop)
        const isGolejada = Math.random() < 0.1;
        let player;
        if (teamChoice === "home") {
          player = homePlayers[Math.floor(Math.random() * homePlayers.length)];
        } else {
          player = awayPlayers[Math.floor(Math.random() * awayPlayers.length)];
        }
        if (player) {
          // Decideix el tipus d'esdeveniment: Goal, Falta o Vermella
          const eventChance = Math.random();
          let eventType = "Goal";
          if (eventChance < 0.5) {
            eventType = "Goal";
          } else if (eventChance < 0.8) {
            eventType = "Falta";
          } else {
            eventType = "Vermella";
          }
          let description = "";
          if (eventType === "Goal") {
            if (isGolejada) {
              if (teamChoice === "home") {
                homeGoals += 2;
              } else {
                awayGoals += 2;
              }
              description = `${player.PlayerName} ha marcat una golejada per a l'${teamChoice === "home" ? "equip local" : "equip visitant"} al minut ${minute}`;
              await updatePlayerStatistics(player.PlayerID, 2, 0, 0, 0);
            } else {
              if (teamChoice === "home") {
                homeGoals++;
              } else {
                awayGoals++;
              }
              description = `${player.PlayerName} ha marcat per a l'${teamChoice === "home" ? "equip local" : "equip visitant"} al minut ${minute}`;
              await updatePlayerStatistics(player.PlayerID, 1, 0, 0, 0);
            }
          } else if (eventType === "Falta") {
            if (teamChoice === "home") {
              homeFouls++;
            } else {
              awayFouls++;
            }
            description = `${player.PlayerName} ha comès una falta per a l'${teamChoice === "home" ? "equip local" : "equip visitant"} al minut ${minute}`;
          } else if (eventType === "Vermella") {
            if (teamChoice === "home") {
              homeRedCards++;
            } else {
              awayRedCards++;
            }
            description = `${player.PlayerName} ha rebut una targeta vermella per a l'${teamChoice === "home" ? "equip local" : "equip visitant"} al minut ${minute}`;
            await updatePlayerStatistics(player.PlayerID, 0, 0, 0, 1);
          }
          const eventObj = {
            minute,
            eventType,
            description,
            team: teamChoice
          };
          events.push(eventObj);
          await addMatchEvent(matchID, player.PlayerID, eventType, minute, description);
          await updateMatchScore(matchID, homeGoals, awayGoals);
        }
      }
    }

    // Simulació dels minuts afegits (extra)
    for (let minute = 91; minute <= 90 + extraMinutes; minute++) {
      await updateMatchTime(matchID, minute);
      await new Promise(resolve => setTimeout(resolve, simulatedMinuteDuration));
      // Durant l'afegit, amb menor probabilitat (20%), només es simula un gol
      if (Math.random() < 0.2) {
        let teamChoice = Math.random() < 0.5 ? "home" : "away";
        let player;
        if (teamChoice === "home") {
          player = homePlayers[Math.floor(Math.random() * homePlayers.length)];
        } else {
          player = awayPlayers[Math.floor(Math.random() * awayPlayers.length)];
        }
        if (player) {
          const eventType = "Goal";
          if (teamChoice === "home") {
            homeGoals++;
          } else {
            awayGoals++;
          }
          const description = `${player.PlayerName} ha marcat per a l'${teamChoice === "home" ? "equip local" : "equip visitant"} al minut ${minute} (afegit)`;
          const eventObj = { minute, eventType, description, team: teamChoice };
          events.push(eventObj);
          await addMatchEvent(matchID, player.PlayerID, eventType, minute, description);
          await updateMatchScore(matchID, homeGoals, awayGoals);
        }
      }
    }

    // Recopila les estadístiques finals
    const totalGoals = homeGoals + awayGoals;
    const totalFouls = homeFouls + awayFouls;
    const totalRedCards = homeRedCards + awayRedCards;

    const summary = {
      homeGoals,
      awayGoals,
      totalGoals,
      homeFouls,
      awayFouls,
      totalFouls,
      homeRedCards,
      awayRedCards,
      totalRedCards,
      extraMinutes,
      finalMinute: 90 + extraMinutes,
      events, // tots els esdeveniments simulats
      currentMinute: 90 + extraMinutes
    };

    // Resolució de les apostes
    let winningTeam = "draw";
    if (homeGoals > awayGoals) {
      winningTeam = "home";
    } else if (awayGoals > homeGoals) {
      winningTeam = "away";
    }
    await resolveBetsForMatch(matchID, winningTeam);

    res.status(200).json(summary);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
};
