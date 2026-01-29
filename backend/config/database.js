const { Pool } = require('pg');

// Create PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: false }
    : false
});

// Unified query wrapper (pg-compatible)
const query = async (text, params = []) => {
  try {
    const result = await pool.query(text, params);
    return result; // { rows, rowCount }
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

// Test connection on startup
pool.connect()
  .then(client => {
    console.log('✅ Connected to PostgreSQL database');
    client.release();
  })
  .catch(err => {
    console.error('❌ PostgreSQL connection failed:', err);
  });

module.exports = {
  query
};
