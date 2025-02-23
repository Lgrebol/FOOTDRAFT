import sql from "mssql";
import connectDb from "../config/db.js";

export const getReservedPlayers = async (req, res) => {
  const { userId } = req.params;

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  
  if (!uuidRegex.test(userId)) {
    return res.status(400).send({ 
      error: "ID d'usuari invàlid",
      exempleValid: "123e4567-e89b-12d3-a456-426614174000"
    });
  }

  try {
    const pool = await connectDb();
    const result = await pool.request()
      .input("userId", sql.UniqueIdentifier, userId)
      .query("SELECT * FROM Players WHERE ReserveUserUUID = @userId");
    res.status(200).json(result.recordset);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
};