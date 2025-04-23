const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('guilds')
    .setDescription('Shows all guilds the bot is in'),

  async execute(interaction, client) {
    // Log client to check if it's defined

    // Ensure the client.guilds object is available
    if (!client || !client.guilds) {
      console.error("Client or client.guilds is undefined.");
      return interaction.reply({ content: 'Bot is not properly initialized.', flags: 64 });
    }

    // Access the cached guilds
    const guilds = client.guilds.cache.map(guild => ({
      name: guild.name,
      id: guild.id,
      memberCount: guild.memberCount,
    }));

    // Generate the list of guilds
    const guildList = guilds
      .map(g => `📌 **${g.name}** \`(${g.id})\` — 👥 ${g.memberCount} members`)
      .join('\n');

    // Truncate the list if it's too long
    const reply = guildList.length > 1950
      ? guildList.slice(0, 1950) + '\n... (truncated)'
      : guildList || 'The bot is not in any guilds.';

    // Send the reply
    await interaction.reply({
      content: `**Guilds the bot is in (${guilds.length}):**\n\n${reply}`,
      flags: 64, // Make the reply ephemeral
    });
  }
};

module.exports.details = {
  name: 'Guild',
  author: 'Vasilew__',
  icon: 'https://cdn.discordapp.com/avatars/1161409662269272135/1ac51b5bbca693172e69336bb35d77b0',
  description: 'Displays the info for the quild.',
  usage: '/guild'
}
