import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import fs from "fs";
import { body } from "express-validator";
import { validationResult } from "express-validator";

dotenv.config();

const SECRET_KEY = process.env.SECRET_KEY;

export const authMiddleware = async (req, res, next) => {
  try {
    // Log de la petició
    const timestamp = new Date().toISOString();
    const method = req.method || "UNKNOWN";
    const url = req.url || "UNKNOWN";

    res.on("finish", () => {
      const statusCode = res.statusCode;
      const logEntry = `${timestamp} - ${method} ${url} - Status: ${statusCode}\n`;

      fs.appendFile("api.log", logEntry, (err) => {
        if (err) {
          console.error("Error escrivint al fitxer de logs", err);
        }
      });
    });

    // Sanitització de dades
    Object.keys(req.body).forEach((key) => {
      body(key).trim().escape();
    });

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Autenticació amb token
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
              { userId: decodedToken.userId, email: decodedToken.email },
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

      const tokenExp = new Date(user.exp * 1000);
      const now = new Date();
      const fiveMinutes = 5 * 60 * 1000;

      if (tokenExp - now < fiveMinutes) {
        const newToken = jwt.sign(
          { userId: user.userId, email: user.email },
          SECRET_KEY,
          { expiresIn: "5m" }
        );
        res.setHeader("New-Token", newToken);
      }

      req.user = user;
      next();
    });
  } catch (error) {
    console.error("Error en authMiddleware:", error);
    return res.status(500).json({
      error: "Error en l'autenticació",
      details: error.message,
    });
  }
};