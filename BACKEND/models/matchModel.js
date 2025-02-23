// matchModel.js
import connectDb from "../config/db.js";
import sql from "mssql";

export const createMatch = async (tournamentUUID, homeTeamUUID, awayTeamUUID, matchDate) => {
  const pool = await connectDb();
  const result = await pool.request()
    .input("tournamentUUID", sql.UniqueIdentifier, tournamentUUID)
    .input("homeTeamUUID", sql.UniqueIdentifier, homeTeamUUID)
    .input("awayTeamUUID", sql.UniqueIdentifier, awayTeamUUID)
    .input("matchDate", sql.DateTime, matchDate)
    .query(
      `INSERT INTO Matches (TournamentUUID, HomeTeamUUID, AwayTeamUUID, MatchDate)
       OUTPUT INSERTED.MatchUUID
       VALUES (@tournamentUUID, @homeTeamUUID, @awayTeamUUID, @matchDate)`
    );
  return result.recordset[0].MatchUUID;
};

export const getMatchById = async (matchUUID) => {
  const pool = await connectDb();
  const result = await pool.request()
    .input("matchUUID", sql.UniqueIdentifier, matchUUID)
    .query("SELECT MatchUUID, TournamentUUID, HomeTeamUUID, AwayTeamUUID, HomeGoals, AwayGoals, MatchDate, CurrentMinute FROM Matches WHERE MatchUUID = @matchUUID");
  return result.recordset[0];
};

export const addMatchEvent = async (matchUUID, playerUUID, eventType, minute, description) => {
  const pool = await connectDb();
  let validPlayerUUID = playerUUID;
  if (eventType === "Break" && playerUUID === '00000000-0000-0000-0000-000000000000') {
    const result = await pool.request()
      .input("matchUUID", sql.UniqueIdentifier, matchUUID)
      .query("SELECT TOP 1 PlayerUUID FROM Players WHERE IsActive = 1");
    if (result.recordset.length > 0) {
      validPlayerUUID = result.recordset[0].PlayerUUID;
    }
  }
  
  await pool.request()
    .input("matchUUID", sql.UniqueIdentifier, matchUUID)
    .input("playerUUID", sql.UniqueIdentifier, validPlayerUUID)
    .input("eventType", sql.VarChar, eventType)
    .input("minute", sql.Int, minute)
    .input("description", sql.VarChar, description)
    .query(
      `INSERT INTO MatchEvents (MatchUUID, PlayerUUID, EventType, Minute, Description)
       VALUES (@matchUUID, @playerUUID, @eventType, @minute, @description)`
    );
};

export const getMatchEvents = async (matchUUID) => {
  const pool = await connectDb();
  const result = await pool.request()
    .input("matchUUID", sql.UniqueIdentifier, matchUUID)
    .query("SELECT * FROM MatchEvents WHERE MatchUUID = @matchUUID ORDER BY Minute");
  return result.recordset;
};

export const updateMatchScore = async (matchUUID, homeGoals, awayGoals) => {
  const pool = await connectDb();
  await pool.request()
    .input("matchUUID", sql.UniqueIdentifier, matchUUID)
    .input("homeGoals", sql.Int, homeGoals)
    .input("awayGoals", sql.Int, awayGoals)
    .query("UPDATE Matches SET HomeGoals = @homeGoals, AwayGoals = @awayGoals WHERE MatchUUID = @matchUUID");
};

export const updatePlayerStatistics = async (playerUUID, goals, assists, yellowCards, redCards) => {
  const pool = await connectDb();
  await pool.request()
    .input("playerUUID", sql.UniqueIdentifier, playerUUID)
    .input("goals", sql.Int, goals)
    .input("assists", sql.Int, assists)
    .input("yellowCards", sql.Int, yellowCards)
    .input("redCards", sql.Int, redCards)
    .query(`UPDATE PlayerStatistics 
      SET Goals = Goals + @goals, 
          Assists = Assists + @assists, 
          YellowCards = YellowCards + @yellowCards, 
          RedCards = RedCards + @redCards 
      WHERE PlayerUUID = @playerUUID`);
};

export const resetMatchData = async (matchUUID) => {
  const pool = await connectDb();
  await pool.request()
    .input("matchUUID", sql.UniqueIdentifier, matchUUID)
    .query("DELETE FROM MatchEvents WHERE MatchUUID = @matchUUID");
  await pool.request()
    .input("matchUUID", sql.UniqueIdentifier, matchUUID)
    .query("UPDATE Matches SET HomeGoals = 0, AwayGoals = 0, CurrentMinute = 0 WHERE MatchUUID = @matchUUID");
};