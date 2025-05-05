const db = require('../database/db');

module.exports = (client) => {
  async function isReactionRolesEnabled(guildId) {
    try {
      const [rows] = await db.execute(
        'SELECT reactionEnabled FROM reaction_roles WHERE id = ?',
        [guildId]
      );
      if (rows.length > 0) {
        return rows[0].reactionEnabled === 1; // or === true depending on your DB structure
      } else {
        return false;
      }
    } catch (error) {
      console.error(`Error checking welcome system for guild ${guildId}:`, error);
      return false;
    }
  }

  async function handleReaction(reaction, user, action) {
    try {
      if (reaction.partial) reaction = await reaction.fetch();
      if (reaction.message.partial) reaction.message = await reaction.message.fetch();
      if (user.partial) user = await user.fetch();

      if (user.bot) return;

      const guildId = reaction.message.guildId; // safer than reaction.guild in partials
      const reactionEnabled = await isReactionRolesEnabled(guildId);
      if (!reactionEnabled) return;

      const emoji = reaction.emoji.id || reaction.emoji.name;
      const messageId = reaction.message.id;
      const [rows] = await db.query(
        'SELECT * FROM reaction_roles WHERE message_id = ? AND emoji = ?',
        [messageId, emoji]
      );

      if (!rows.length) return;

      const guild = reaction.message.guild;
      const member = await guild.members.fetch(user.id);
      const role = guild.roles.cache.get(rows[0].role_id);

      if (!role || !member) return;

      if (action === 'add') {
        await member.roles.add(role);
      } else {
        await member.roles.remove(role);
      }
    } catch (err) {
      console.error('Reaction handler error:', err);
    }
  }

  client.on('messageReactionAdd', (reaction, user) => handleReaction(reaction, user, 'add'));
  client.on('messageReactionRemove', (reaction, user) => handleReaction(reaction, user, 'remove'));
};