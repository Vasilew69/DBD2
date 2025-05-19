const db = require("../database/db");
const getLevelFromXP = (xp) => Math.floor(xp / 100);

async function messageXp(client) {
client.on('messageCreate', async (message) => {
  if (message.author.bot || message.guild === null) return;

  const userId = message.author.id;
  const guildId = message.guild.id;
  const username = message.author.username;

  const [rows] = await db.query(
    'SELECT * FROM levels_data WHERE user_id = ? AND guild_id = ?',
    [userId, guildId]
  );

  if (rows.length === 0) {
    await db.query(
      'INSERT INTO levels_data (user_id, username, guild_id, xp, level) VALUES (?, ?, ?, ?, ?)',
      [userId, username, guildId, 10, 1,]
    );
    return;
  }

  let userData = rows[0];
  let newXP = userData.xp + 10; // Earn 10 XP per message
  let newLevel = getLevelFromXP(newXP);

  if (newLevel > userData.level) {
    await message.channel.send(`🎉 <@${username}> leveled up to **Level ${newLevel}**!`);
  }

  await db.query(
    'UPDATE levels_data SET xp = ?, level = ? WHERE user_id = ? AND guild_id = ?',
    [newXP, newLevel, userId, guildId]
  );
});
}

module.exports = messageXp;
