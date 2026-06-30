import mysql from "mysql2/promise";

export const db = mysql.createPool({
  host: process.env.DB_HOST,
  // Menggunakan parseInt untuk memastikan tipe datanya adalah angka (number) yang valid untuk TypeScript
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: {}, // Wajib objek kosong untuk enkripsi SSL Clever Cloud
  waitForConnections: true,
  connectionLimit: 10,
});