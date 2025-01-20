const express = require('express');
const dotenv = require('dotenv');
const connectToDatabase = require('./config/db'); // Importa el mòdul de connexió a la base de dades

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Endpoint de prova de connexió
app.get('/test-connection', async (req, res) => {
  try {
    const pool = await connectToDatabase(); // Connexió amb la base de dades
    const result = await pool.request().query('SELECT 1 + 1 AS result'); // Consulta simple
    res.status(200).json({
      message: 'Connexió a la base de dades exitosa!',
      result: result.recordset,
    });
    pool.close(); // Tanca la connexió després d'usar-la
  } catch (err) {
    console.error('Error durant la connexió o consulta:', err);
    res.status(500).send('Error de connexió amb la base de dades');
  }
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor escoltant a http://localhost:${port}`);
});
