const db = require("../database/db");
async function getLevelFromXP(db, guildId, xp) {
  const [level_roles] = await db.query(
    'SELECT * FROM level_roles WHERE guild_id = ? ORDER BY level ASC',
    [guildId]
  );

  let level = 0;

  for (const row of level_roles) {
    const requiredXP = row.level * 10; // adjust this if you have custom XP thresholds
    if (xp >= requiredXP) {
      level = row.level;
    } else {
      break;
    }
  }

  return level;
}

async function messageXp(client) {
  client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.guild) return;

    const userId = message.author.id;
    const guildId = message.guild.id;
    const username = message.author.username;

    const [settings] = await db.query('SELECT * FROM levels_settings WHERE guild_id = ?', [guildId]);
    if (!settings.length) return; // Ако няма настройки, спираме

    const setting = settings[0];
    const xpPerMessage = setting.xp_per_message || 10; // fallback 10 XP

    const [rows] = await db.query(
      'SELECT * FROM levels_data WHERE user_id = ? AND guild_id = ?',
      [userId, guildId]
    );

    if (rows.length === 0) {
      // Вкарваме нов потребител със стартови XP и level 0
      await db.query(
        'INSERT INTO levels_data (user_id, username, guild_id, xp, level) VALUES (?, ?, ?, ?, ?)',
        [userId, username, guildId, xpPerMessage, 0]
      );
      return;
    }

    const userData = rows[0];
    const newXP = userData.xp + xpPerMessage;
    const newLevel = await getLevelFromXP(db, guildId, newXP);

    const [levelRow] = await db.query(
      'SELECT * FROM level_roles WHERE guild_id = ? AND level = ?',
      [guildId, newLevel]
    );

    if (newLevel > userData.level && levelRow.length > 0 > 0) {
      await NewLevel(message, levelRow[0].role_id, userId);

      const levelChannel = await message.guild.channels.fetch(setting.level_up_channel).catch(() => null);

      if (!levelChannel || !levelChannel.isTextBased()) {
        return message.channel.send('Level-up channel is not set or is invalid.');
      }

      if (levelChannel?.isTextBased()) {
  const msg = setting.custom_level_message
    .replace('{user}', `<@${userId}>`)
    .replace('{level}', newLevel);

  await levelChannel.send(msg);
}
    }

    await db.query(
      'UPDATE levels_data SET xp = ?, level = ? WHERE user_id = ? AND guild_id = ?',
      [newXP, newLevel, userId, guildId]
    );
  });
}

async function NewLevel(message, roleId, userId) {
  if (!message.guild) {
    console.error('Guild is undefined');
    return;
  }

  const guild = message.guild;
  const role = guild.roles.cache.get(roleId);

  if (!role) {
    return message.channel.send('Role not found.');
  }

  const member = await guild.members.fetch(userId).catch(() => null);
  if (!member) {
    return message.channel.send('Member not found.');
  }

  try {
    await member.roles.add(role);
  } catch (err) {
    console.error('Failed to add role:', err);
    message.channel.send('Could not add role.');
  }
}

module.exports = messageXp;
