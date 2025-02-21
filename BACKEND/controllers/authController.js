import connectDb from "../config/db.js";
import sql from "mssql";
import jwt from "jsonwebtoken";

export const getCurrentUser = async (req, res) => {
  try {
    const userUUID = req.user.userUUID; 
    
    const pool = await connectDb();
    const result = await pool
      .request()
      .input("userUUID", sql.UniqueIdentifier, userUUID)
      .query(`
        SELECT UserUUID, Name, Email, Footcoins 
        FROM Users 
        WHERE UserUUID = @userUUID
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: "Usuari no trobat" });
    }
    
    const userData = result.recordset[0];
    res.json({
      userUUID: userData.UserUUID,
      name: userData.Name,
      email: userData.Email,
      footcoins: userData.Footcoins
    });
    
  } catch (error) {
    console.error("Error obtenint l'usuari:", error);
    res.status(500).json({ error: "Error obtenint l'usuari" });
  }
};

export const loginUsers = async (req, res) => {
  try {
    const { email, password } = req.body;
    const pool = await connectDb();
    
    const result = await pool.request()
      .input('email', sql.VarChar, email)
      .query('SELECT * FROM Users WHERE Email = @email');

    if (result.recordset.length === 0) {
      return res.status(401).json({ error: "Credencials invàlides" });
    }

    const user = result.recordset[0];
    const token = jwt.sign(
      {
        userUUID: user.UserUUID,
        email: user.Email,
        footcoins: user.Footcoins
      },
      process.env.JWT_SECRET,
      { expiresIn: '10h' }
    );

    res.status(200).json({ 
      token, 
      footcoins: user.Footcoins 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
