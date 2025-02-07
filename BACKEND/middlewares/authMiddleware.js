import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const authMiddleware = async (req, res, next) => {
  try {
    console.log("🔹 Petició rebuda:", req.method, req.url);

    // 1️⃣ Validar header Authorization
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
      return res.status(401).json({ error: "Header d'autorització requerit" });
    }

    // 2️⃣ Extraure token
    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "Format de token invàlid" });
    }

    // 3️⃣ Verificar SECRET_KEY
    if (!process.env.JWT_SECRET) {
      console.error("🚨 SECRET_KEY no definit!");
      return res.status(500).json({ error: "Error de configuració del servidor" });
    }

    // 4️⃣ Verificar i decodificar token
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        console.error("❌ Error de verificació:", err.message);
        return res.status(403).json({
          error: "Token invàlid",
          details: err.message.replace('jwt', 'JWT') // Neteja missatges d'error
        });
      }

      // 5️⃣ Assegurar estructura correcta del payload
      if (!decoded?.userId) {
        console.error("⚠️ Token no conté userId:", decoded);
        return res.status(403).json({ error: "Token mal format" });
      }

      console.log("✅ Accés autoritzat per a userId:", decoded.userId);
      req.user = { userId: decoded.userId }; // Normalitzem l'objecte usuari
      next();
    });

  } catch (error) {
    console.error("🔥 Error crític en authMiddleware:", error);
    res.status(500).json({
      error: "Error d'autenticació",
      details: error.message
    });
  }
};