import process from 'node:process';
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  ssl: process.env.DB_SSL === "true" ? {} : void 0,
  waitForConnections: true,
  connectionLimit: 10
});

export { pool as p };
//# sourceMappingURL=db.mjs.map
