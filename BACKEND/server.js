const express = require('express');
const mysql = require('mysql2');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Connexió a la base de dades
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

// Provar la connexió amb la base de dades
connection.connect((err) => {
  if (err) {
    console.error('Error de connexió a la base de dades:', err);
    return;
  }
  console.log('Connexió establerta correctament a la base de dades');
});

// Endpoint de prova
app.get('/test-connection', (req, res) => {
  connection.query('SELECT 1 + 1 AS result', (err, results) => {
    if (err) {
      res.status(500).send('Error de connexió amb la base de dades');
    } else {
      res.status(200).send('Connexió a la base de dades exitosa!');
    }
  });
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor escoltant a http://localhost:${port}`);
});
