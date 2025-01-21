const sql = require("mssql");
require("dotenv").config();

const dbConfig = {
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  options: {
    encrypt: process.env.DB_ENCRYPT === "true",
    trustServerCertificate: process.env.DB_TRUST_CERT === "true",
  },
};

let pool;

const connectDb = async () => {
  try {
    if (!pool) {
      pool = await sql.connect(dbConfig);
      console.log("Connexió amb la base de dades correcta");
    }
    return pool;
  } catch (err) {
    console.error("Error al connectar amb la base de dades:", err.message);
    throw err;
  }
};

module.exports = connectDb;
