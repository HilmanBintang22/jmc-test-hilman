import mysql from "mysql2/promise";

export const db = mysql.createPool({
  host: (useRuntimeConfig().dbHost as string) || process.env.DB_HOST,
  port: useRuntimeConfig().dbPort ? parseInt(useRuntimeConfig().dbPort as string) : 3306,
  user: (useRuntimeConfig().dbUser as string) || process.env.DB_USER,
  password: (useRuntimeConfig().dbPassword as string) || process.env.DB_PASSWORD,
  database: (useRuntimeConfig().dbName as string) || process.env.DB_NAME,
  ssl: {
    rejectUnauthorized: false
  }, 
  waitForConnections: true,
  connectionLimit: 10,
});

export default db;