const db = require('./database/db'); // Adjust path to your DB config

async function testConnection() {
  try {
    const [rows] = await db.query('SELECT 1 + 1 AS solution');
    console.log('Database connection successful. Result:', rows[0].solution);
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

testConnection().then(success => {
  if (!success) process.exit(1);
});