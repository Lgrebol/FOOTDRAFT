// models/betModel.js
import connectDb from "../config/db.js";
import sql from "mssql";

// Inserta una nova aposta amb estat 'pending'
export const createBet = async (userID, matchID, amount, predictedWinner) => {
  const pool = await connectDb();
  const result = await pool.request()
    .input("userID", sql.Int, userID)
    .input("matchID", sql.Int, matchID)
    .input("amount", sql.Decimal(18,2), amount)
    .input("predictedWinner", sql.VarChar, predictedWinner)
    .query(
      `INSERT INTO Bets (UserID, MatchID, Amount, PredictedWinner, Status)
       OUTPUT INSERTED.BetID
       VALUES (@userID, @matchID, @amount, @predictedWinner, 'pending')`
    );
  return result.recordset[0].BetID;
};

// Obté totes les apostes d'un partit
export const getBetsByMatch = async (matchID) => {
  const pool = await connectDb();
  const result = await pool.request()
    .input("matchID", sql.Int, matchID)
    .query("SELECT * FROM Bets WHERE MatchID = @matchID");
  return result.recordset;
};

// Actualitza l'estat d'una aposta i, opcionalment, el guany
export const updateBetStatus = async (betID, status, winnings = 0) => {
  const pool = await connectDb();
  await pool.request()
    .input("betID", sql.Int, betID)
    .input("status", sql.VarChar, status)
    .input("winnings", sql.Decimal(18,2), winnings)
    .query("UPDATE Bets SET Status = @status, Winnings = @winnings WHERE BetID = @betID");
};

// Actualitza el saldo (Footcoins) d'un usuari (suma o resta segons si amount és positiu o negatiu)
export const updateUserFootcoins = async (userID, amount) => {
  const pool = await connectDb();
  await pool.request()
    .input("userID", sql.Int, userID)
    .input("amount", sql.Decimal(18,2), amount)
    .query("UPDATE Users SET Footcoins = Footcoins + @amount WHERE UserID = @userID");
};

// Obté els Footcoins actuals d'un usuari
export const getUserFootcoins = async (userID) => {
  const pool = await connectDb();
  const result = await pool.request()
    .input("userID", sql.Int, userID)
    .query("SELECT Footcoins FROM Users WHERE UserID = @userID");
  return result.recordset[0].Footcoins;
};
