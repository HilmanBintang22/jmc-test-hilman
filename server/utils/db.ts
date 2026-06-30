import process from "node:process";
import mysql from "mysql2/promise";

// Ubah menjadi 'export const db' agar Nitro bisa mendeteksi nama variabelnya secara otomatis
export const db = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 3306, // Ditambahkan || 3306 sebagai cadangan jika port kosong
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD, // Diubah dari DB_PASS menjadi DB_PASSWORD agar lebih umum
  database: process.env.DB_NAME,
  ssl: process.env.DB_SSL === "true" ? {} : undefined,
  waitForConnections: true,
  connectionLimit: 10,
});