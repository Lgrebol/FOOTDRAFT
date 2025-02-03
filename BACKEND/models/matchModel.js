// models/matchModel.js
import connectDb from "../config/db.js";
import sql from "mssql";

// Crear una partida (match)
export const createMatch = async (tournamentID, homeTeamID, awayTeamID, matchDate) => {
  const pool = await connectDb();
  const result = await pool.request()
    .input("tournamentID", sql.Int, tournamentID)
    .input("homeTeamID", sql.Int, homeTeamID)
    .input("awayTeamID", sql.Int, awayTeamID)
    .input("matchDate", sql.DateTime, matchDate)
    .query(
      `INSERT INTO Matches (TournamentID, HomeTeamID, AwayTeamID, MatchDate)
       OUTPUT INSERTED.MatchID
       VALUES (@tournamentID, @homeTeamID, @awayTeamID, @matchDate)`
    );
  return result.recordset[0].MatchID;
};

// Obtenir informació d'una partida
export const getMatchById = async (matchID) => {
  const pool = await connectDb();
  const result = await pool.request()
    .input("matchID", sql.Int, matchID)
    .query("SELECT * FROM Matches WHERE MatchID = @matchID");
  return result.recordset[0];
};

// Afegir un esdeveniment a la partida amb el nou esquema
export const addMatchEvent = async (matchID, playerID, eventType, minute, description) => {
  const pool = await connectDb();
  await pool.request()
    .input("matchID", sql.Int, matchID)
    .input("playerID", sql.Int, playerID)
    .input("eventType", sql.VarChar, eventType)
    .input("minute", sql.Int, minute)
    .input("description", sql.VarChar, description)
    .query(
      `INSERT INTO MatchEvents (MatchID, PlayerID, EventType, Minute, Description)
       VALUES (@matchID, @playerID, @eventType, @minute, @description)`
    );
};

// Obtenir tots els esdeveniments d'una partida (ordenats per minut)
export const getMatchEvents = async (matchID) => {
  const pool = await connectDb();
  const result = await pool.request()
    .input("matchID", sql.Int, matchID)
    .query("SELECT * FROM MatchEvents WHERE MatchID = @matchID ORDER BY Minute");
  return result.recordset;
};

// Actualitzar el marcador de la partida
export const updateMatchScore = async (matchID, homeGoals, awayGoals) => {
  const pool = await connectDb();
  await pool.request()
    .input("matchID", sql.Int, matchID)
    .input("homeGoals", sql.Int, homeGoals)
    .input("awayGoals", sql.Int, awayGoals)
    .query("UPDATE Matches SET HomeGoals = @homeGoals, AwayGoals = @awayGoals WHERE MatchID = @matchID");
};

// Actualitzar les estadístiques d'un jugador (incrementar per exemple el nombre de gols)
export const updatePlayerStatistics = async (playerID, goals, assists, yellowCards, redCards) => {
  const pool = await connectDb();
  await pool.request()
    .input("playerID", sql.Int, playerID)
    .input("goals", sql.Int, goals)
    .input("assists", sql.Int, assists)
    .input("yellowCards", sql.Int, yellowCards)
    .input("redCards", sql.Int, redCards)
    .query(`UPDATE Player_Statistics 
            SET Goals = Goals + @goals, 
                Assists = Assists + @assists, 
                YellowCards = YellowCards + @yellowCards, 
                RedCards = RedCards + @redCards 
            WHERE PlayerID = @playerID`);
};

export const resetMatchData = async (matchID) => {
  const pool = await connectDb();
  // Esborrem tots els esdeveniments associats al match
  await pool.request()
    .input("matchID", sql.Int, matchID)
    .query("DELETE FROM MatchEvents WHERE MatchID = @matchID");
  // Reiniciem el marcador a 0
  await pool.request()
    .input("matchID", sql.Int, matchID)
    .query("UPDATE Matches SET HomeGoals = 0, AwayGoals = 0 WHERE MatchID = @matchID");
};
