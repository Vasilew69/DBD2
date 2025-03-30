const { SlashCommandBuilder, time, EmbedBuilder } = require("discord.js");
const { useTimeline } = require("discord-player");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pause')
        .setDescription('Pause the queue'),
    async execute(interaction) {
        const timeline = useTimeline()
    
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
            `The player is now ${wasPaused ? 'playing' : 'paused'}.`,
        )
    }
}