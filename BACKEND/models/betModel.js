import connectDb from "../config/db.js";
import sql from "mssql";

export const createBet = async (userUUID, matchUUID, amount, predictedWinner, homeTeamUUID, awayTeamUUID) => {
  const pool = await connectDb();
  const result = await pool.request()
    .input("userUUID", sql.UniqueIdentifier, userUUID)
    .input("matchUUID", sql.UniqueIdentifier, matchUUID)
    .input("amount", sql.Decimal(18, 2), amount)
    .input("predictedWinner", sql.VarChar, predictedWinner)
    .input("homeTeamUUID", sql.UniqueIdentifier, homeTeamUUID)
    .input("awayTeamUUID", sql.UniqueIdentifier, awayTeamUUID)
    .query(
      `INSERT INTO Bets (UserUUID, MatchUUID, Amount, PredictedWinner, Status, HomeTeamUUID, AwayTeamUUID)
       OUTPUT INSERTED.BetUUID
       VALUES (@userUUID, @matchUUID, @amount, @predictedWinner, 'pending', @homeTeamUUID, @awayTeamUUID)`
    );
  return result.recordset[0].BetUUID;
};

export const getBetsByMatch = async (matchUUID) => {
  const pool = await connectDb();
  const result = await pool.request()
    .input("matchUUID", sql.UniqueIdentifier, matchUUID)
    .query("SELECT * FROM Bets WHERE MatchUUID = @matchUUID");
  return result.recordset;
};

export const updateBetStatus = async (betUUID, status, winnings = 0) => {
  const pool = await connectDb();
  await pool.request()
    .input("betUUID", sql.UniqueIdentifier, betUUID)
    .input("status", sql.VarChar, status)
    .input("winnings", sql.Decimal(18, 2), winnings)
    .query("UPDATE Bets SET Status = @status, Winnings = @winnings WHERE BetUUID = @betUUID");
};

export const updateUserFootcoins = async (userUUID, amount) => {
  const pool = await connectDb();
  const result = await pool
    .request()
    .input("userUUID", sql.UniqueIdentifier, userUUID)
    .input("amount", sql.Decimal(18, 2), amount)
    .query("UPDATE Users SET Footcoins = Footcoins + @amount WHERE UserUUID = @userUUID");
  
  console.log(`Actualitzat saldo usuari ${userUUID}: +${amount} Footcoins`);
  return result;
};

export const getUserFootcoins = async (userUUID) => {
  const pool = await connectDb();
  const result = await pool.request()
    .input("userUUID", sql.UniqueIdentifier, userUUID)
    .query("SELECT Footcoins FROM Users WHERE UserUUID = @userUUID");
  return result.recordset[0].Footcoins;
};