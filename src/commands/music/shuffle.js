const { useQueue } = require("discord-player");
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
    .setName('shuffle')
    .setDescription('shuffle the songs'),
    async execute(interaction) {
        const queue = useQueue()

        if(!queue) {
            const noEmbed = new EmbedBuilder()
            noEmbed.setTitle('No Active Queue')
            noEmbed.setDescription('No active queue to shuffle.')
            return interaction.reply({ embeds: [noEmbed] });
        }

        if(queue.tracks.size < 2) {
            const tooFewEmbed = new EmbedBuilder()
            tooFewEmbed.setTitle('Not Enough Tracks')
            tooFewEmbed.setDescription('There must be at least two tracks to shuffle.')
            return interaction.reply({ embeds: [tooFewEmbed] });
        }

        queue.tracks.shuffle();

        const shuffleEmbed = new EmbedBuilder()
        shuffleEmbed.setTitle('Queue Shuffled')
        shuffleEmbed.setDescription('The queue has been shuffled.')
        shuffleEmbed.setColor(0x0099FF)
        return interaction.reply({ embeds: [shuffleEmbed] });
    }
}