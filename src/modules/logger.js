const db = require('../database/db');

async function logEvent({ userId, username, content, type, guildname }) {
  try {
    await db.execute(
      'INSERT INTO logs (userId, username, content, type, guildname ) VALUES (?, ?, ?, ?, ?)',
      [userId, username, content, type, guildname]
    );
  } catch (err) {
    console.error('Error logging event:', err);
  }
}

module.exports = { logEvent };