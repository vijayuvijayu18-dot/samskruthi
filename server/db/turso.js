import { createClient } from '@libsql/client';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment from server/.env first, then root .env
dotenv.config({ path: path.join(__dirname, '..', '.env') });
dotenv.config();

const url = process.env.TURSO_DATABASE_URL || 'libsql://samskruthi-uvijay.aws-ap-south-1.turso.io';
const authToken = process.env.TURSO_AUTH_TOKEN || '';

if (!authToken) {
  console.warn('⚠️  TURSO_AUTH_TOKEN is not configured in server/.env');
}

export const turso = createClient({
  url,
  authToken,
});

export default turso;
