const db = require('../database/db');

async function logEvent({ userId, username, content, type, guildname, guildid }) {
  try {
    await db.execute(
      'INSERT INTO logs (userId, username, content, type, guildname, guildid ) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, username, content, type, guildname, guildid]
    );
  } catch (err) {
    console.error('Error logging event:', err);
  }
}

module.exports = { logEvent };