const mysql = require('mysql2/promise');

let pool;

function mysqlConfig(includeDatabase = true) {
  const config = {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    namedPlaceholders: false
  };

  if (includeDatabase) {
    config.database = process.env.DB_NAME || 'car_rental_db';
  }

  return config;
}

async function getPool() {
  if (!pool) {
    pool = mysql.createPool(mysqlConfig(true));
    await pool.query('SELECT 1');
  }

  return pool;
}

async function query(sql, params = []) {
  const db = await getPool();
  const [rows] = await db.execute(sql, params);
  return rows;
}

module.exports = {
  getPool,
  mysql,
  mysqlConfig,
  query
};
