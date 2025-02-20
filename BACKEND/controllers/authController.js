import connectDb from "../config/db.js";
import sql from "mssql";
import jwt from "jsonwebtoken";

export const getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.userId; // Assegurar que el middleware estableix userId
    
    const pool = await connectDb();
    const result = await pool
      .request()
      .input("userID", sql.Int, userId)
      .query(`
        SELECT UserID, Name, Email, Footcoins 
        FROM Users 
        WHERE UserID = @userID
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: "Usuari no trobat" });
    }
    
    const userData = result.recordset[0];
    res.json({
      UserID: userData.UserID,
      Name: userData.Name,
      Email: userData.Email,
      Footcoins: userData.Footcoins // Assegurar aquest camp
    });
    
  } catch (error) {
    console.error("Error obtenint l'usuari:", error);
    res.status(500).json({ error: "Error obtenint l'usuari" });
  }
};

// Exemple de controlador de login (per referència)
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
    // Aquí aniria la verificació real de la contrasenya (hashejada)

    const token = jwt.sign(
      {
        userId: user.UserID,
        email: user.Email,
        footcoins: user.Footcoins // ← Això és el que mostrarem al front
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