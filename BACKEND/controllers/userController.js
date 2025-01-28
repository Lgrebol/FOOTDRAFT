import { validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import connectDb from "../config/db.js";
import sql from "mssql";


// Registration logic
export const registerUsers = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array() });
  }

  const { name, email, password } = req.body;

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

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ error: "Error registering user" });
  }
};

// Login logic
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
      { userId: user.UserID, name: user.Name },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ error: "Error logging in" });
  }
};

// Get all users logic
export const getUsers = async (req, res) => {
  try {
    const pool = await connectDb();
    const result = await pool
      .request()
      .query("SELECT UserID, Name AS UserName FROM Users");

    res.status(200).json(result.recordset);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Error fetching users" });
  }
};

