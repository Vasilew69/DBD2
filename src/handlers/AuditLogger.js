const { EmbedBuilder, ChannelType } = require('discord.js');
const db = require('../database/db');
const { logEvent } = require('../modules/logger');

module.exports = (client) => {
  async function getLogChannel(guildId) {
    const [rows] = await db.execute(
      'SELECT log_channel_id FROM automod_config WHERE guild_id = ?',
      [guildId]
    );
    if (!rows.length) return null;
    return rows[0].log_channel_id;
  }

  async function log(guild, embed) {
    const logChannelId = await getLogChannel(guild.id);
    if (!logChannelId) return;

    const logChannel = guild.channels.cache.get(logChannelId);
    if (!logChannel || logChannel.type !== ChannelType.GuildText) return;

    logChannel.send({ embeds: [embed] }).catch(console.error);
  }

  client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.guild) return;

    let content = message.content?.trim();
    if (!content && message.attachments.size > 0) {
        content = '[Attachment]';
      } else if (!content) {
        content = '[Empty or non-text message]';
      }
    await logEvent({
      userId: message.author.id,
      username: message.author.username,
      content,
      type: "message",
      guildname: message.guild.name,
      guildid: message.guild.id,
    });
    const embed = new EmbedBuilder()
      .setColor(0x3498db)
      .setTitle("🆕 Message Created")
      .setDescription(`**Author:** <@${message.author.id}>\n**Channel:** <#${message.channel.id}>`)
      .addFields({ name: "Content", value: message.content || "*No content*" })
      .setTimestamp();

    await log(message.guild, embed);
  });

  client.on('messageUpdate', async (oldMsg, newMsg) => {
    if (oldMsg.partial || newMsg.partial || !newMsg.guild || oldMsg.content === newMsg.content) return;

    const embed = new EmbedBuilder()
      .setColor(0xf1c40f)
      .setTitle("✏️ Message Edited")
      .setDescription(`**Author:** <@${newMsg.author.id}>\n**Channel:** <#${newMsg.channel.id}>`)
      .addFields(
        { name: "Before", value: oldMsg.content || "*No content*" },
        { name: "After", value: newMsg.content || "*No content*" }
      )
      .setTimestamp();

    await log(newMsg.guild, embed);
  });

  client.on('messageDelete', async (message) => {
    if (message.partial || !message.guild) return;

    const embed = new EmbedBuilder()
      .setColor(0xe74c3c)
      .setTitle("🗑️ Message Deleted")
      .setDescription(`**Author:** <@${message.author?.id || "Unknown"}>\n**Channel:** <#${message.channel.id}>`)
      .addFields({ name: "Content", value: message.content || "*No content*" })
      .setTimestamp();

    await log(message.guild, embed);
  });

  client.on('interactionCreate', async (interaction) => {
    if (!interaction.guild || !interaction.isCommand()) return;

    const embed = new EmbedBuilder()
      .setColor(0x9b59b6)
      .setTitle("⚙️ Slash Command Used")
      .setDescription(`**User:** <@${interaction.user.id}>\n**Command:** \`/${interaction.commandName}\``)
      .setTimestamp();

    await log(interaction.guild, embed);
  });
};