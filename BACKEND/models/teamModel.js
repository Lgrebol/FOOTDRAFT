import connectDb from "../config/db.js";
import sql from "mssql";

export const createTeam = async (name) => {
  const pool = await connectDb();
  await pool
    .request()
    .input("name", sql.VarChar, name)
    .query("INSERT INTO Teams (Name) VALUES (@name)");
};

export const getAllTeams = async () => {
  const pool = await connectDb();
  const result = await pool.request().query("SELECT * FROM Teams");
  return result.recordset;
};

export const getTeamById = async (teamId) => {
  const pool = await connectDb();
  const result = await pool
    .request()
    .input("teamId", sql.Int, teamId)
    .query("SELECT * FROM Teams WHERE TeamID = @teamId");
  return result.recordset[0];
};

export const deleteTeam = async (teamId) => {
  const pool = await connectDb();
  await pool
    .request()
    .input("teamId", sql.Int, teamId)
    .query("DELETE FROM Teams WHERE TeamID = @teamId");
};
