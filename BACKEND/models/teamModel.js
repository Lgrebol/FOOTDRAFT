import connectDb from "../config/db.js";
import sql from "mssql";

export const createTeam = async (name) => {
  const pool = await connectDb();
  await pool
    .request()
    .input("name", sql.VarChar, name)
    .query("INSERT INTO Teams (TeamName) VALUES (@name)");
};

export const getAllTeams = async () => {
  const pool = await connectDb();
  const result = await pool.request().query("SELECT * FROM Teams");
  return result.recordset;
};

export const getTeamById = async (teamUUID) => {
  const pool = await connectDb();
  const result = await pool
    .request()
    .input("teamUUID", sql.UniqueIdentifier, teamUUID)
    .query("SELECT * FROM Teams WHERE TeamUUID = @teamUUID");
  return result.recordset[0];
};

export const deleteTeam = async (teamUUID) => {
  const pool = await connectDb();
  await pool
    .request()
    .input("teamUUID", sql.UniqueIdentifier, teamUUID)
    .query("DELETE FROM Teams WHERE TeamUUID = @teamUUID");
};
