const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../../database/db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rank')
    .setDescription('View your current level and XP'),
  async execute(interaction) {
    const userId = interaction.user.id;
    const guildId = interaction.guild.id;

    const [rows] = await db.query(
      'SELECT * FROM levels_data WHERE user_id = ? AND guild_id = ?',
      [userId, guildId]
    );

    if (rows.length === 0) {
      return interaction.reply("You don't have any XP yet.");
    }

    const { xp, level } = rows[0];
    const embed = new EmbedBuilder()
      .setTitle(`${interaction.user.username}'s Rank`)
      .setDescription(`Level: **${level}**\nXP: **${xp}**`)
      .setColor(0x00ffcc);

    await interaction.reply({ embeds: [embed] });
  },
};

module.exports.details = {
    name: 'rank',
    author: 'Vasilew__',
    icon: 'https://cdn.discordapp.com/avatars/1161409662269272135/1ac51b5bbca693172e69336bb35d77b0',
    description: 'Displays your rank',
    usage: '/rank'
}