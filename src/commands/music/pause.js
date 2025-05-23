const { SlashCommandBuilder, time, EmbedBuilder } = require("discord.js");
const { useTimeline } = require("discord-player");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pause')
        .setDescription('Pause or continue the queue'),
    async execute(interaction) {
        const timeline = useTimeline({ node: interaction.guildId })
    
        if(!timeline) {
            const tmeEmbed = new EmbedBuilder()
            tmeEmbed.setTitle('Player Status')
            tmeEmbed.addFields({
                name: 'Status',
                value: 'No active player session.',
                inline: true,
            })
            return interaction.reply({ embeds: [tmeEmbed] });
        }

        const wasPaused = timeline.paused;

        wasPaused ? timeline.resume() : timeline.pause();

        await interaction.reply(
            `The player is now ${wasPaused ? 'playing' : 'paused'} on time ${timeline.timestamp.progress}.`,
        )
    }
}

module.exports.details = {
    name: 'Pause',
    author: 'Vasilew__',
    icon: 'https://cdn.discordapp.com/avatars/1161409662269272135/1ac51b5bbca693172e69336bb35d77b0',
    description: 'Pauses the queue.',
    usage: '/pause'
}