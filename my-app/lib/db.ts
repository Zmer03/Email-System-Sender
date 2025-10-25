// lib/db.ts
import mysql from "mysql2/promise";

declare global {
    // eslint-disable-next-line no-var
    var __MYSQL_POOL__: mysql.Pool | undefined;
  }
  
  function createPool(): mysql.Pool {
    return mysql.createPool({
      host: process.env.DB_HOST!,
      port: Number(process.env.DB_PORT || 3306),
      user: process.env.DB_USER!,
      password: process.env.DB_PASSWORD!,
      database: process.env.DB_NAME!,     // DB must already exist
      waitForConnections: true,
      connectionLimit: 10,
      connectTimeout: 60_000,
      supportBigNumbers: true,
    });
  }
  
  export function getPool() {
    if (!global.__MYSQL_POOL__) {
      global.__MYSQL_POOL__ = createPool();
    }
    return global.__MYSQL_POOL__;
  }

export async function initializeSchema() {
  // 1) ensure database exists (no default DB here)
  const root = await getPool().getConnection();
  try {
    await root.query(
      `CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\`
       CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
    );
  } finally {
    await root.release();
  }

  // 2) ensure tables exist (now connect with default DB)
  const conn = await getPool().getConnection();
  try {
    await conn.query(`
        CREATE TABLE IF NOT EXISTS subscribers (
          id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
          email VARCHAR(254) NOT NULL,
          full_name VARCHAR(200) NOT NULL,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          confirmed_at TIMESTAMP NULL,
          confirm_token CHAR(43) NULL,
          confirm_expires TIMESTAMP NULL,
          UNIQUE KEY uq_email (email),
          UNIQUE KEY uq_confirm_token (confirm_token)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);
  } finally {
    conn.release();
  }
}

