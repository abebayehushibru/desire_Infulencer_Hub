import pg from 'pg';
import { ENV } from './env.js';

const { Pool } = pg;

const pool = new Pool({
  host: ENV.DB_HOST,
  port: Number(ENV.DB_PORT),
  database: ENV.DB_NAME,
  user: ENV.DB_USER,
  password: String(ENV.DB_PASSWORD), // scram-sha-256 requires a string
});

// Test the connection on startup
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ PostgreSQL connection error:', err.message);
  } else {
    release();
    console.log(`✅ PostgreSQL connected to: ${ENV.DB_NAME}`);
  }
});

export default pool;
