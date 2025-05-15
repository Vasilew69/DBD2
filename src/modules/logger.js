const db = require('../database/db');

async function logEvent({ userId, username, content, type, guildname, guildid, channelId }) {
  try {
    await db.execute(
      'INSERT INTO logs (userId, username, content, type, guildname, guildid, channelId ) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [userId, username, content, type, guildname, guildid, channelId]
    );
  } catch (err) {
    console.error('Error logging event:', err);
  }
}

module.exports = { logEvent };