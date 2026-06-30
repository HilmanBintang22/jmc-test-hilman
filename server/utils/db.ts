import process from "node:process";
import mysql from "mysql2/promise";

export const db = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: {}, // <--- UBAH BAGIAN INI: Cukup ketik {} untuk memaksa SSL aktif di serverless Vercel
  waitForConnections: true,
  connectionLimit: 10,
});