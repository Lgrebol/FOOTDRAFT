import sql from "mssql";
import connectDb from "../config/db.js";

export const getAllPlayers = async () => {
  const pool = await connectDb();
  const result = await pool.request().query("SELECT * FROM Players");
  return result.recordset;
};

export const getPlayerById = async (id) => {
  const pool = await connectDb();
  const result = await pool
    .request()
    .input("PlayerID", sql.Int, id)
    .query("SELECT * FROM Players WHERE PlayerID = @PlayerID");
  return result.recordset[0];
};

export const createPlayer = async (player) => {
  const { PlayerName, Position, Points, TeamID } = player;
  const pool = await connectDb();
  const result = await pool
    .request()
    .input("PlayerName", sql.VarChar, PlayerName)
    .input("Position", sql.VarChar, Position)
    .input("Points", sql.Int, Points || 0)
    .input("TeamID", sql.Int, TeamID)
    .query(
      "INSERT INTO Players (PlayerName, Position, Points, TeamID) VALUES (@PlayerName, @Position, @Points, @TeamID); SELECT SCOPE_IDENTITY() AS PlayerID;"
    );
  return result.recordset[0];
};

export const updatePlayer = async (id, player) => {
  const { PlayerName, Position, Points, TeamID } = player;
  const pool = await connectDb();
  await pool
    .request()
    .input("PlayerID", sql.Int, id)
    .input("PlayerName", sql.VarChar, PlayerName)
    .input("Position", sql.VarChar, Position)
    .input("Points", sql.Int, Points)
    .input("TeamID", sql.Int, TeamID)
    .query(
      "UPDATE Players SET PlayerName=@PlayerName, Position=@Position, Points=@Points, TeamID=@TeamID WHERE PlayerID=@PlayerID"
    );
};

export const deletePlayer = async (id) => {
  const pool = await connectDb();
  await pool
    .request()
    .input("PlayerID", sql.Int, id)
    .query("DELETE FROM Players WHERE PlayerID = @PlayerID");
};