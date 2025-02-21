import connectDb from "../config/db.js";
import sql from "mssql";

export const createPlayer = async (name, position, teamUUID) => {
  const pool = await connectDb();
  await pool
    .request()
    .input("name", sql.VarChar, name)
    .input("position", sql.VarChar, position)
    .input("teamUUID", sql.UniqueIdentifier, teamUUID)
    .query(
      "INSERT INTO Players (PlayerName, Position, TeamID) VALUES (@name, @position, @teamUUID)"
    );
};

export const getAllPlayers = async () => {
  const pool = await connectDb();
  const result = await pool.request().query("SELECT * FROM Players");
  return result.recordset;
};

export const getPlayersByTeam = async (teamUUID) => {
  const pool = await connectDb();
  const result = await pool
    .request()
    .input("teamUUID", sql.UniqueIdentifier, teamUUID)
    .query("SELECT * FROM Players WHERE TeamID = @teamUUID");
  return result.recordset;
};

export const deletePlayer = async (playerUUID) => {
  const pool = await connectDb();
  await pool
    .request()
    .input("playerUUID", sql.UniqueIdentifier, playerUUID)
    .query("DELETE FROM Players WHERE PlayerUUID = @playerUUID");
};
