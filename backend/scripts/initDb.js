const fs = require('fs');
const path = require('path');
const { pool } = require('../config/db');

async function initDb() {
  try {
    const schemaSql = fs.readFileSync(path.join(__dirname, '../sql/schema.sql'), 'utf-8');
    console.log('Applying database schema...');
    await pool.query(schemaSql);
    console.log('Database tables created successfully.');
  } catch (err) {
    console.error('Error initializing database schema:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  initDb();
}

module.exports = initDb;
