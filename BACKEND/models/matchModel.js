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
      `INSERT INTO Matches (TournamentID, HomeTeamID, AwayTeamID, MatchDate)
       OUTPUT INSERTED.MatchUUID
       VALUES (@tournamentUUID, @homeTeamUUID, @awayTeamUUID, @matchDate)`
    );
  return result.recordset[0].MatchUUID;
};

export const getMatchById = async (matchUUID) => {
  const pool = await connectDb();
  const result = await pool.request()
    .input("matchUUID", sql.UniqueIdentifier, matchUUID)
    .query("SELECT * FROM Matches WHERE MatchUUID = @matchUUID");
  return result.recordset[0];
};

export const addMatchEvent = async (matchUUID, playerUUID, eventType, minute, description) => {
  const pool = await connectDb();
  await pool.request()
    .input("matchUUID", sql.UniqueIdentifier, matchUUID)
    .input("playerUUID", sql.UniqueIdentifier, playerUUID)
    .input("eventType", sql.VarChar, eventType)
    .input("minute", sql.Int, minute)
    .input("description", sql.VarChar, description)
    .query(
      `INSERT INTO MatchEvents (MatchID, PlayerID, EventType, Minute, Description)
       VALUES (@matchUUID, @playerUUID, @eventType, @minute, @description)`
    );
};

export const getMatchEvents = async (matchUUID) => {
  const pool = await connectDb();
  const result = await pool.request()
    .input("matchUUID", sql.UniqueIdentifier, matchUUID)
    .query("SELECT * FROM MatchEvents WHERE MatchID = @matchUUID ORDER BY Minute");
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
    .query(`UPDATE Player_Statistics 
            SET Goals = Goals + @goals, 
                Assists = Assists + @assists, 
                YellowCards = YellowCards + @yellowCards, 
                RedCards = RedCards + @redCards 
            WHERE PlayerID = @playerUUID`);
};

export const resetMatchData = async (matchUUID) => {
  const pool = await connectDb();
  await pool.request()
    .input("matchUUID", sql.UniqueIdentifier, matchUUID)
    .query("DELETE FROM MatchEvents WHERE MatchID = @matchUUID");
  await pool.request()
    .input("matchUUID", sql.UniqueIdentifier, matchUUID)
    .query("UPDATE Matches SET HomeGoals = 0, AwayGoals = 0 WHERE MatchUUID = @matchUUID");
};
