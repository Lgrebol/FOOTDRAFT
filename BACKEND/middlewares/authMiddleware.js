import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const authMiddleware = async (req, res, next) => {
  try {
    console.log("🔹 Petició rebuda:", req.method, req.url);

    const authHeader = req.headers["authorization"];
    if (!authHeader) {
      return res.status(401).json({ error: "Header d'autorització requerit" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "Format de token invàlid" });
    }

    if (!process.env.JWT_SECRET) {
      console.error("🚨 SECRET_KEY no definit!");
      return res.status(500).json({ error: "Error de configuració del servidor" });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        console.error("❌ Error de verificació:", err.message);
        return res.status(403).json({
          error: "Token invàlid",
          details: err.message.replace('jwt', 'JWT')
        });
      }

      if (!decoded?.userUUID) {
        console.error("⚠️ Token no conté userUUID:", decoded);
        return res.status(403).json({ error: "Token mal format" });
      }

      console.log("✅ Accés autoritzat per a userUUID:", decoded.userUUID);
      req.user = { userUUID: decoded.userUUID };
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
