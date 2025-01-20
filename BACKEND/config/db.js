require('dotenv').config(); // Carrega les variables d'entorn
const sql = require('mssql');

// Configuració de la base de dades
const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_HOST,
  database: process.env.DB_NAME,
  options: {
    encrypt: false, // Desactiva l'encriptació (per a connexions locals)
    trustServerCertificate: true,
  },
};

// Funció per connectar-se a la base de dades
const connectToDatabase = async () => {
  try {
    const pool = await sql.connect(dbConfig);
    console.log('Connexió establerta correctament a la base de dades');
    return pool; // Retorna la connexió
  } catch (err) {
    console.error('Error de connexió a la base de dades:', err);
    throw err; // Llença l’error perquè es pugui gestionar
  }
};

module.exports = connectToDatabase;
