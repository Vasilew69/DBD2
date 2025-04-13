const db = require('../database/db');

async function logEvent({ userId, username, content, type }) {
  try {
    await db.execute(
      'INSERT INTO logs (userId, username, content, type) VALUES (?, ?, ?, ?)',
      [userId, username, content, type]
    );
  } catch (err) {
    console.error('Error logging event:', err);
  }
}

module.exports = { logEvent };