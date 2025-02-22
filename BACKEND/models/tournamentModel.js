import connectDb from "../config/db.js";
import sql from "mssql";

export const createTournament = async (tournamentName, tournamentType, startDate, endDate) => {
  const pool = await connectDb();
  await pool
    .request()
    .input("tournamentName", sql.VarChar, tournamentName)
    .input("tournamentType", sql.VarChar, tournamentType)
    .input("startDate", sql.Date, startDate)
    .input("endDate", sql.Date, endDate)
    .query(
      "INSERT INTO Tournaments (TournamentName, TournamentType, StartDate, EndDate) VALUES (@tournamentName, @tournamentType, @startDate, @endDate)"
    );
};

export const getAllTournaments = async () => {
  const pool = await connectDb();
  const result = await pool.request().query("SELECT * FROM Tournaments");
  return result.recordset;
};

export const getTournamentById = async (tournamentUUID) => {
  const pool = await connectDb();
  const result = await pool
    .request()
    .input("tournamentUUID", sql.UniqueIdentifier, tournamentUUID)
    .query("SELECT * FROM Tournaments WHERE TournamentUUID = @tournamentUUID");
  return result.recordset[0];
};

export const deleteTournament = async (tournamentUUID) => {
  const pool = await connectDb();
  await pool
    .request()
    .input("tournamentUUID", sql.UniqueIdentifier, tournamentUUID)
    .query("DELETE FROM Tournaments WHERE TournamentUUID = @tournamentUUID");
};

export const registerTeamToTournament = async (teamUUID, tournamentUUID) => {
  const pool = await connectDb();
  await pool
    .request()
    .input("teamUUID", sql.UniqueIdentifier, teamUUID)
    .input("tournamentUUID", sql.UniqueIdentifier, tournamentUUID)
    .query(
      "INSERT INTO Teams_Tournaments (TeamUUID, TournamentUUID) VALUES (@teamUUID, @tournamentUUID)"
    );
};