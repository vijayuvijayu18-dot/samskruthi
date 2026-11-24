import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createClient } from '@libsql/client';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  console.error('❌ Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN in server/.env');
  process.exit(1);
}

const turso = createClient({ url, authToken });

async function runAuthMigration() {
  console.log('⚡ Running Turso Authentication & Account Management Migration...');

  try {
    // 1. Ensure new columns on users table
    const tableInfo = await turso.execute(`PRAGMA table_info(users);`);
    const existingColumns = tableInfo.rows.map((r) => r.name);

    if (!existingColumns.includes('email_verified_at')) {
      console.log('➕ Adding email_verified_at to users...');
      await turso.execute(`ALTER TABLE users ADD COLUMN email_verified_at DATETIME;`);
    }

    if (!existingColumns.includes('last_login_at')) {
      console.log('➕ Adding last_login_at to users...');
      await turso.execute(`ALTER TABLE users ADD COLUMN last_login_at DATETIME;`);
    }

    if (!existingColumns.includes('updated_at')) {
      console.log('➕ Adding updated_at to users...');
      await turso.execute(`ALTER TABLE users ADD COLUMN updated_at DATETIME;`);
    }

    // 2. Auth Providers Table
    console.log('📦 Creating auth_providers table...');
    await turso.execute(`
      CREATE TABLE IF NOT EXISTS auth_providers (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        provider TEXT NOT NULL,
        provider_user_id TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(provider, provider_user_id)
      );
    `);

    // 3. Sessions Table
    console.log('📦 Creating sessions table...');
    await turso.execute(`
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token_hash TEXT NOT NULL,
        user_agent TEXT,
        ip_address TEXT,
        is_active INTEGER DEFAULT 1,
        expires_at DATETIME NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 4. Login History Table
    console.log('📦 Creating login_history table...');
    await turso.execute(`
      CREATE TABLE IF NOT EXISTS login_history (
        id TEXT PRIMARY KEY,
        user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
        email TEXT,
        login_method TEXT NOT NULL,
        ip_address TEXT,
        user_agent TEXT,
        status TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 5. Password Resets Table
    console.log('📦 Creating password_resets table...');
    await turso.execute(`
      CREATE TABLE IF NOT EXISTS password_resets (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token_hash TEXT NOT NULL,
        expires_at DATETIME NOT NULL,
        used_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 6. Email Verifications Table
    console.log('📦 Creating email_verifications table...');
    await turso.execute(`
      CREATE TABLE IF NOT EXISTS email_verifications (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token_hash TEXT NOT NULL,
        expires_at DATETIME NOT NULL,
        verified_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 7. Notifications Table
    console.log('📦 Creating notifications table...');
    await turso.execute(`
      CREATE TABLE IF NOT EXISTS notifications (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        data TEXT,
        is_read INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 8. Email Outbox & Audit Table
    console.log('📦 Creating email_outbox table...');
    await turso.execute(`
      CREATE TABLE IF NOT EXISTS email_outbox (
        id TEXT PRIMARY KEY,
        recipient TEXT NOT NULL,
        subject TEXT NOT NULL,
        email_type TEXT NOT NULL,
        body_html TEXT NOT NULL,
        body_text TEXT,
        status TEXT DEFAULT 'pending',
        error_message TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('🎉 Turso Authentication & Account Management Tables successfully migrated!');
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  }
}

runAuthMigration();
