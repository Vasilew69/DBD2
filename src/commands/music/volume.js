const { useQueue } = require("discord-player");
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
    .setName('volume')
    .setDescription('set the volume')
    .addNumberOption(option => option
        .setName('strenght')
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
    name: 'Volume',
    description: 'Set the volume of the music player',
    usage: '/volume <volume_level>',
    author: 'Vasiew__',
    icon: 'https://cdn.discordapp.com/avatars/1161409662269272135/1ac51b5bbca693172e69336bb35d77b0',
}