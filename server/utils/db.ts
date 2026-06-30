import mysql from "mysql2/promise"; // Pastikan ada /promise

export const db = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: {}, 
  waitForConnections: true,
  connectionLimit: 10,
});

export default db;