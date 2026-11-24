import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from '../db/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
  console.log('🏛️  Starting PostgreSQL Migration for SAMSKRUTHI...');

  const schemaPath = path.join(__dirname, '..', 'db', 'schema.sql');
  const seedPath = path.join(__dirname, '..', 'db', 'seed.sql');

  const schemaSql = fs.readFileSync(schemaPath, 'utf8');
  const seedSql = fs.readFileSync(seedPath, 'utf8');

  const client = await pool.connect();
  try {
    console.log('📦 Executing schema.sql...');
    await client.query(schemaSql);
    console.log('✅ Schema created successfully!');

    console.log('🌱 Executing seed.sql...');
    await client.query(seedSql);
    console.log('✅ Seed data inserted successfully!');
    console.log('🎉 PostgreSQL Database is fully ready!');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration();
