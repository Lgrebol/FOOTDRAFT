require('dotenv').config(); // Carrega les variables del fitxer .env

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sql = require('mssql');
const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Configuració de la connexió (variables des del fitxer .env)
const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    options: {
        encrypt: process.env.DB_ENCRYPT === 'true',
        trustServerCertificate: process.env.DB_TRUST_CERT === 'true',
    },
};

// Connexió a la base de dades
sql.connect(dbConfig)
    .then(() => console.log('Connected to the database!'))
    .catch((err) => console.error('Database connection failed:', err));

// Endpoint de prova
app.get('/', (req, res) => {
    res.send('Backend for FOOTDRAFT is running');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
