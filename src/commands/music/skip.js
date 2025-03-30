const { useQueue } = require("discord-player");
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
    .setName('skip')
    .setDescription('skip hte current song'),
    async execute(interaction) {
        const queue = useQueue();

        if(!queue) {
            const noEmbed = new EmbedBuilder()
            noEmbed.setTitle('No Active Player Session')
            noEmbed.setColor(0x0099FF);
            noEmbed.setDescription('No active player session found on this server.')
            return interaction.reply({embeds: [noEmbed] });
        }

        if(!queue.isPlaying) {
            const nopEmbed = new EmbedBuilder()
            nopEmbed.setTitle('No Track Playing')
            nopEmbed.setColor(0x0099FF);
            nopEmbed.setDescription('There is no track currently playing.')
            return interaction.reply({embeds: [nopEmbed] });
        }

        queue.node.skip();

        const skipEmbed = new EmbedBuilder()
        skipEmbed.setTitle('Song Skipped')
        skipEmbed.setColor(0x0099FF);
        skipEmbed.setDescription('The current song has been skipped.')
        return interaction.reply({embeds: [skipEmbed] });
    }
}