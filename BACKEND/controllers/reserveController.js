import sql from "mssql";
import connectDb from "../config/db.js";

export const getReservedPlayers = async (req, res) => {
  const { userId } = req.params;

  try {
    const pool = await connectDb();
    const result = await pool.request()
      .input("userId", sql.UniqueIdentifier, userId)
      .query("SELECT * FROM Players WHERE ReserveUserID = @userId");
    res.status(200).json(result.recordset);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
};
