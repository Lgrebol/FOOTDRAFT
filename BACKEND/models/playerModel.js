import connectDb from "../config/db.js";
import sql from "mssql";

export const createPlayer = async (name, position, teamId) => {
  const pool = await connectDb();
  await pool
    .request()
    .input("name", sql.VarChar, name)
    .input("position", sql.VarChar, position)
    .input("teamId", sql.Int, teamId)
    .query(
      "INSERT INTO Players (Name, Position, TeamID) VALUES (@name, @position, @teamId)"
    );
};

export const getAllPlayers = async () => {
  const pool = await connectDb();
  const result = await pool.request().query("SELECT * FROM Players");
  return result.recordset;
};

export const getPlayersByTeam = async (teamId) => {
  const pool = await connectDb();
  const result = await pool
    .request()
    .input("teamId", sql.Int, teamId)
    .query("SELECT * FROM Players WHERE TeamID = @teamId");
  return result.recordset;
};

export const deletePlayer = async (playerId) => {
  const pool = await connectDb();
  await pool
    .request()
    .input("playerId", sql.Int, playerId)
    .query("DELETE FROM Players WHERE PlayerID = @playerId");
};
