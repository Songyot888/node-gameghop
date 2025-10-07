import { createPool } from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

export const pool = createPool({
  connectionLimit: 10,
  host: process.env.DB_HOST || "ns1.server-82-26-104-71.da.direct",
  user: process.env.DB_USER || "activi89_mb68_66011212090",
  password: process.env.DB_PASSWORD || "KSsZwmmm8CCkVjpGaTUp",
  database: process.env.DB_NAME || "activi89_mb68_66011212090",
  port: Number(process.env.DB_PORT) || 3306,
});

pool.getConnection()
  .then(connection => {
    console.log("✅ Database connected successfully");
    connection.release();
  })
  .catch(err => {
    console.error("❌ Database connection failed:", err.message);
  });