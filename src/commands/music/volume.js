const { useQueue } = require("discord-player");
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
    .setName('volume')
    .setDescription('set the volume')
    .addNumberOption(option => option
        .setName('volume')
        .setDescription('how much to be')
        .setRequired(true)
    ),
    async execute(interaction) {
        const queue = useQueue(interaction.guild.id);
        const volume = interaction.options.getNumber('volume')

        if(!queue) {
            const noqEmbed = new EmbedBuilder()
            noqEmbed.setTitle('No Queue')
            noqEmbed.setColor(0x0099FF)
            return interaction.reply({embeds: [noqEmbed],   })
        }

        queue.node.setVolume(volume)
        const volEmbed = new EmbedBuilder()
        volEmbed.setTitle('Volume Set')
        volEmbed.setColor(0x0099FF)
        volEmbed.setDescription(`Volume set to ${volume}`)
        return interaction.reply({embeds: [volEmbed],   })
    }
}

module.exports.details = {
    name: 'volume',
    description: 'Set the volume of the music player',
    usage: 'volume <volume_level>',
    author: 'Vasiew__',
    icon: 'https://cdn.discordapp.com/avatars/826389195618607124/529f31f0499b2d0d5304b634c16d8966',
}