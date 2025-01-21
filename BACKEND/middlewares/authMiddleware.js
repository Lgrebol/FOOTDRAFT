import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import fs from "fs";
import { body, validationResult } from "express-validator";

dotenv.config();

const SECRET_KEY = process.env.SECRET_KEY;

// Middleware d'autenticació
export const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];

    if (!authHeader) {
      return res
        .status(401)
        .json({ error: "No s'ha proporcionat el header d'autorització" });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "No s'ha proporcionat el token" });
    }

    jwt.verify(token, SECRET_KEY, (err, user) => {
      if (err) {
        if (err.name === "TokenExpiredError") {
          try {
            const decodedToken = jwt.decode(token);

            const newToken = jwt.sign(
              { userId: decodedToken.userId, username: decodedToken.username },
              SECRET_KEY,
              { expiresIn: "1h" }
            );

            res.setHeader("New-Token", newToken);
            req.user = decodedToken;
            return next();
          } catch (renewError) {
            console.error("Error al renovar el token:", renewError);
            return res.status(403).json({
              error: "Error al renovar el token",
              details: renewError.message,
            });
          }
        }

        console.error("Error verificació token:", err);
        return res.status(403).json({
          error: "Token invàlid",
          details: err.message,
        });
      }

      req.user = user;
      next();
    });
  } catch (error) {
    console.error("Error en autentificació:", error);
    return res.status(500).json({
      error: "Error en l'autenticació",
      details: error.message,
    });
  }
};

// Middleware de log de peticions
export const logRequest = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const method = req.method || "UNKNOWN";
  const url = req.url || "UNKNOWN";

  res.on("finish", () => {
    const statusCode = res.statusCode;
    const logEntry = `${timestamp} - ${method} ${url} - Status: ${statusCode}\n`;

    fs.appendFile("api.log", logEntry, (err) => {
      if (err) {
        console.error("Error escribint al fitxer de logs", err);
      }
    });
  });
  next();
};

// Middleware per sanejar les dades
export const sanitizeData = (req, res, next) => {
  Object.keys(req.body).forEach((key) => {
    body(key).trim().escape();
  });
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  next();
};