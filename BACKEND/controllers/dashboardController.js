import connectDb from "../config/db.js";
import sql from "mssql";

export const getDashboardStats = async (req, res) => {
  try {
    const pool = await connectDb();
    const result = await pool.request().query(`
      SELECT 
        (SELECT COUNT(*) FROM Teams) AS totalTeams,
        (SELECT COUNT(*) FROM Players) AS totalPlayers,
        (SELECT COUNT(*) FROM Tournaments) AS totalTournaments,
        (SELECT ISNULL(SUM(HomeGoals + AwayGoals), 0) FROM Matches) AS totalGoals,
        (SELECT COUNT(*) FROM Matches) AS totalMatches
    `);
    res.status(200).json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};