import { validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import connectDb from "../config/db.js";
import sql from "mssql";

export const registerUsers = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array() });
  }

  const { name, email, password } = req.body;

  try {
    const pool = await connectDb();
    const hashedPassword = await bcrypt.hash(password, 10);
    const userUUID = uuidv4();

    await pool
      .request()
      .input("name", sql.VarChar, name)
      .input("email", sql.VarChar, email)
      .input("password", sql.VarChar, hashedPassword)
      .input("footcoins", sql.Decimal(18, 2), 100000)
      .input("userUUID", sql.UniqueIdentifier, userUUID)
      .query(
        "INSERT INTO Users (Name, Email, PasswordHash, Footcoins, UserUUID) VALUES (@name, @email, @password, @footcoins, @userUUID)"
      );

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ error: "Error registering user" });
  }
};

export const loginUsers = async (req, res) => {
  const { email, password } = req.body;

  try {
    const pool = await connectDb();
    const result = await pool
      .request()
      .input("email", sql.VarChar, email)
      .query("SELECT * FROM Users WHERE Email = @email");

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = result.recordset[0];
    const match = await bcrypt.compare(password, user.PasswordHash);

    if (!match) {
      return res.status(401).json({ error: "Incorrect password" });
    }

    const token = jwt.sign(
      { userUUID: user.UserUUID, name: user.Name },
      process.env.JWT_SECRET,
      { expiresIn: "10h" }
    );

    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ error: "Error logging in" });
  }
};

export const getUsers = async (req, res) => {
  try {
    const pool = await connectDb();
    const result = await pool.request().query(`
      SELECT 
        UserUUID,
        COALESCE(Name, Email) AS username,
        Email,
        Footcoins
      FROM Users
    `);
    
    const users = result.recordset.map(user => ({
      UserUUID: user.UserUUID,
      username: user.username,
      Email: user.Email,
      Footcoins: user.Footcoins
    }));

    res.status(200).json(users);
  } catch (err) {
    res.status(500).send({ 
      error: "Error obtenint usuaris",
      detalls: err.message 
    });
  }
};