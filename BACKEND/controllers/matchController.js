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

export const resetMatchController = async (req, res) => {
  const { matchID } = req.body;
  if (!matchID) return res.status(400).send({ error: "Falta el camp matchID." });
  try {
    await resetMatchData(matchID);
    res.status(200).json({ message: "Dades del partit reiniciades correctament." });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
};

export const createMatchController = async (req, res) => {
  try {
    const { tournamentUUID, homeTeamUUID, awayTeamUUID, matchDate } = req.body;
    const matchID = await createMatch(tournamentUUID, homeTeamUUID, awayTeamUUID, matchDate);
    res.status(201).json({ matchID });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
};

export const updateMatchTime = async (matchID, currentMinute) => {
  const pool = await connectDb();
  await pool
    .request()
    .input("matchID", sql.UniqueIdentifier, matchID)
    .input("currentMinute", sql.Int, currentMinute)
    .query("UPDATE Matches SET CurrentMinute = @currentMinute WHERE MatchUUID = @matchID");
};

export const getMatchController = async (req, res) => {
  try {
    const { matchID } = req.params;
    const match = await getMatchById(matchID);
    if (!match) return res.status(404).send({ error: "Partida no trobada" });
    
    // Mapeja els esdeveniments per tenir els noms correctes (minúscules)
    const eventsFromDB = await getMatchEvents(matchID);
    const events = eventsFromDB.map(event => ({
      minute: event.Minute,
      eventType: event.EventType,
      description: event.Description,
      team: ''
    }));
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
    const match = await getMatchById(matchID);
    if (!match) return res.status(404).send({ error: "Partida no trobada." });
    
    const pool = await connectDb();

    const homePlayersResult = await pool
      .request()
      .input("teamID", sql.UniqueIdentifier, match.HomeTeamUUID)
      .query("SELECT PlayerUUID, PlayerName FROM Players WHERE TeamUUID = @teamID AND IsActive = 1");

    const awayPlayersResult = await pool
      .request()
      .input("teamID", sql.UniqueIdentifier, match.AwayTeamUUID)
      .query("SELECT PlayerUUID, PlayerName FROM Players WHERE TeamUUID = @teamID AND IsActive = 1");

    const homePlayers = homePlayersResult.recordset;
    const awayPlayers = awayPlayersResult.recordset;

    if (homePlayers.length < 5) {
      return res.status(400).json({ error: "L'equip local ha de tenir exactament 5 jugadors actius." });
    }
    if (awayPlayers.length < 5) {
      return res.status(400).json({ error: "L'equip visitant ha de tenir exactament 5 jugadors actius." });
    }

    let homeGoals = 0;
    let awayGoals = 0;
    let homeFouls = 0;
    let awayFouls = 0;
    let homeRedCards = 0;
    let awayRedCards = 0;
    let events = [];

    // Cada minut simulat dura 333ms; es simulen 90 minuts més minuts afegits
    const simulatedMinuteDuration = 333;
    const extraMinutes = Math.floor(Math.random() * 5) + 1;

    for (let minute = 1; minute <= 90; minute++) {
      await updateMatchTime(matchID, minute);
      
      if (minute === 45) {
        const breakDescription = "Break de mitja partida";
        events.push({ minute, eventType: "Break", description: breakDescription, team: '' });
        await addMatchEvent(matchID, '00000000-0000-0000-0000-000000000000', "Break", minute, breakDescription);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      await new Promise(resolve => setTimeout(resolve, simulatedMinuteDuration));
      
      if (Math.random() < 0.3) {
        let teamChoice;
        if (Math.abs(homeGoals - awayGoals) >= 2) {
          teamChoice = homeGoals > awayGoals ? "away" : "home";
        } else {
          teamChoice = Math.random() < 0.5 ? "home" : "away";
        }
        const isGolejada = Math.random() < 0.1;
        let player = teamChoice === "home" 
          ? homePlayers[Math.floor(Math.random() * homePlayers.length)]
          : awayPlayers[Math.floor(Math.random() * awayPlayers.length)];
        if (player) {
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
              await updatePlayerStatistics(player.PlayerUUID, 2, 0, 0, 0);
            } else {
              if (teamChoice === "home") {
                homeGoals++;
              } else {
                awayGoals++;
              }
              description = `${player.PlayerName} ha marcat per a l'${teamChoice === "home" ? "equip local" : "equip visitant"} al minut ${minute}`;
              await updatePlayerStatistics(player.PlayerUUID, 1, 0, 0, 0);
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
            await updatePlayerStatistics(player.PlayerUUID, 0, 0, 0, 1);
          }
          const eventObj = { minute, eventType, description, team: teamChoice };
          events.push(eventObj);
          await addMatchEvent(matchID, player.PlayerUUID, eventType, minute, description);
          await updateMatchScore(matchID, homeGoals, awayGoals);
        }
      }
    }
    
    // Simulació dels minuts afegits
    for (let minute = 91; minute <= 90 + extraMinutes; minute++) {
      await updateMatchTime(matchID, minute);
      await new Promise(resolve => setTimeout(resolve, simulatedMinuteDuration));
      if (Math.random() < 0.2) {
        let teamChoice = Math.random() < 0.5 ? "home" : "away";
        let player = teamChoice === "home" 
          ? homePlayers[Math.floor(Math.random() * homePlayers.length)]
          : awayPlayers[Math.floor(Math.random() * awayPlayers.length)];
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
          await addMatchEvent(matchID, player.PlayerUUID, eventType, minute, description);
          await updateMatchScore(matchID, homeGoals, awayGoals);
        }
      }
    }
    
    const totalGoals = homeGoals + awayGoals;
    const totalFouls = homeFouls + awayFouls;
    const totalRedCards = homeRedCards + awayRedCards;
    
    let winningTeam = "draw";
    if (homeGoals > awayGoals) {
      winningTeam = "home";
    } else if (awayGoals > homeGoals) {
      winningTeam = "away";
    }
    await resolveBetsForMatch(matchID, winningTeam);
    
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
      events,
      currentMinute: 90 + extraMinutes,
      matchEnded: true,
      message: "El partit ha finalitzat. Mostrant estadístiques finals."
    };
    
    res.status(200).json(summary);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
};
