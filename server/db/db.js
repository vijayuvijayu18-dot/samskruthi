import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/samskruthi_db';

// Enable SSL if connecting to remote databases (e.g., Supabase, Neon, GCP)
const isRemote = connectionString.includes('sslmode=require') || 
                 connectionString.includes('supabase') || 
                 connectionString.includes('neon.tech') ||
                 connectionString.includes('amazonaws.com') ||
                 connectionString.includes('render.com');

export const pool = new Pool({
  connectionString,
  ssl: isRemote ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client:', err);
});

export const query = (text, params) => pool.query(text, params);
