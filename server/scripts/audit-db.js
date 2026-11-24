import { turso } from '../db/turso.js';

async function audit() {
  console.log('=== TURSO DATABASE AUDIT ===');
  const tables = await turso.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name;");
  console.log('Tables found:', tables.rows.map(r => r.name));

  for (const table of tables.rows) {
    const tableName = table.name;
    const count = await turso.execute(`SELECT COUNT(*) as c FROM ${tableName};`);
    const cols = await turso.execute(`PRAGMA table_info(${tableName});`);
    console.log(`\nTable: ${tableName} (${count.rows[0].c} rows)`);
    console.log('Columns:', cols.rows.map(c => `${c.name} (${c.type})`).join(', '));
  }
}

audit().catch(console.error);
