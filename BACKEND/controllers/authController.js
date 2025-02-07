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
export const loginUser = async (req, res) => {
  try {
    // ... lògica de autenticació ...
    
    const token = jwt.sign(
      {
        userId: user.UserID, // Assegurar incloure userId
        email: user.Email
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    res.json({ token, Footcoins: user.Footcoins });
    
  } catch (error) {
    console.error("Error en el login:", error);
    res.status(500).json({ error: "Error en el login" });
  }
};