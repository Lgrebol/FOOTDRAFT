const { validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const connectDb = require("../config/db");
const sql = require("mssql");

// Registre d'usuaris
exports.registerUsers = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array() });
  }

  const { name, email, password } = req.body;
  console.log("Dades rebudes en el servidor:", req.body);

  try {
    const pool = await connectDb();
    const hashedPassword = await bcrypt.hash(password, 10);
    const uuid = uuidv4();

    await pool
      .request()
      .input("name", sql.VarChar, name)
      .input("email", sql.VarChar, email)
      .input("password", sql.VarChar, hashedPassword)
      .query(
        "INSERT INTO Users (Name, Email, PasswordHash) VALUES (@name, @email, @password)"
      );

    res.status(201).json({ message: "Usuari registrat correctament" });
  } catch (error) {
    console.error("Error al registrar l'usuari", error);
    res.status(500).json({ error: "Error al registrar l'usuari" });
  }
};

// Inici de sessió
exports.loginUsers = async (req, res) => {
  const { email, password } = req.body;

  try {
    const pool = await connectDb();
    const result = await pool
      .request()
      .input("email", sql.VarChar, email)
      .query("SELECT * FROM Users WHERE Email = @email");

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: "Usuari no trobat" });
    }

    const user = result.recordset[0];
    const match = await bcrypt.compare(password, user.PasswordHash);

    if (!match) {
      return res.status(401).json({ error: "Contrasenya incorrecta" });
    }

    const token = jwt.sign(
      { userId: user.UserID, name: user.Name },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({ message: "Inici de sessió correcte", token });
  } catch (error) {
    console.error("Error al iniciar sessió:", error);
    res.status(500).json({ error: "Error al iniciar sessió" });
  }
};