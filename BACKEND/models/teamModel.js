import sql from "mssql";
import connectDb from "../config/db.js";

export const getAllTeams = async () => {
  const pool = await connectDb();
  const result = await pool.request().query("SELECT * FROM Teams");
  return result.recordset;
};

export const getTeamById = async (id) => {
  const pool = await connectDb();
  const result = await pool
    .request()
    .input("TeamID", sql.Int, id)
    .query("SELECT * FROM Teams WHERE TeamID = @TeamID");
  return result.recordset[0];
};

export const createTeam = async (team) => {
  const { TeamName, League } = team;
  const pool = await connectDb();
  const result = await pool
    .request()
    .input("TeamName", sql.VarChar, TeamName)
    .input("League", sql.VarChar, League)
    .query("INSERT INTO Teams (TeamName, League) VALUES (@TeamName, @League); SELECT SCOPE_IDENTITY() AS TeamID;");
  return result.recordset[0];
};

// Update and delete models would follow the same pattern as above.
