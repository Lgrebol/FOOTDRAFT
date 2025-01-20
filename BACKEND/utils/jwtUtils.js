const jwt = require('jsonwebtoken');
require('dotenv').config();  // Carregar variables d'entorn

// Generar un JWT
function generateToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRATION });
}

// Verificar un JWT
function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (err) {
    return null;  // Si el token és invàlid
  }
}

module.exports = {
  generateToken,
  verifyToken
};
