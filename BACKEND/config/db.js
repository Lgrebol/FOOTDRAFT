import sql from "mssql";
import dotenv from "dotenv";

dotenv.config();

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
      console.log("Database connection successful");
    }
    return pool;
  } catch (err) {
    console.error("Database connection error:", err.message);
    throw err;
  }
};

export default connectDb;
