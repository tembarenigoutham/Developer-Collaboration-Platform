import mysql from 'mysql2/promise';
import { config } from './env.js';

// Create connection pool
export const pool = mysql.createPool({
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
  waitForConnections: config.db.waitForConnections,
  connectionLimit: config.db.connectionLimit,
  queueLimit: config.db.queueLimit,
  enableKeepAlive: config.db.enableKeepAlive,
  keepAliveInitialDelay: config.db.keepAliveInitialDelay
});

/**
 * Execute parameterized query safely
 * @param {string} sql
 * @param {Array} params
 * @returns {Promise<Array>}
 */
export const query = async (sql, params = []) => {
  const [results] = await pool.execute(sql, params);
  return results;
};

/**
 * Verify database connectivity on startup
 */
export const testDatabaseConnection = async () => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT DATABASE() AS db_name, VERSION() AS version');
    connection.release();
    console.log(`✅ MySQL Connected: ${rows[0].db_name} (v${rows[0].version})`);
    return true;
  } catch (error) {
    console.error('❌ Database Connection Error:', error.message);
    return false;
  }
};

export default {
  pool,
  query,
  testDatabaseConnection
};
