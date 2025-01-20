require('dotenv').config(); // Carrega les variables del fitxer .env
const mysql = require('mysql2/promise'); // Usa mysql2 amb promeses

// Configuració de la connexió
const pool = mysql.createPool({
  host: process.env.DB_HOST,         // Host de la base de dades
  user: process.env.DB_USER,         // Usuari de la base de dades
  password: process.env.DB_PASSWORD, // Contrasenya de la base de dades
  database: process.env.DB_NAME,     // Nom de la base de dades
  waitForConnections: true,          // Esperar connexions disponibles
  connectionLimit: 10,               // Límit de connexions al pool
  queueLimit: 0                      // Sense límit de cua
});

// Comprovació de la connexió
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log('Connexió establerta correctament a la base de dades');
    connection.release(); // Allibera la connexió al pool
  } catch (err) {
    console.error('Error de connexió a la base de dades:', err.message);
  }
})();

module.exports = pool; // Exporta el pool per reutilitzar-lo a altres llocs
