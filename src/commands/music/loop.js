const { QueueRepeatMode, useQueue } = require("discord-player");
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('loop')
        .setDescription('change the loop mode')
        .addNumberOption(option => 
            option
            .setName('mode')
            .setDescription('witch to be used')
            .setRequired(true)
            .setChoices(
                {
                    name: 'Off',
                    value: QueueRepeatMode.OFF,
                },
                {
                    name: 'Track',
                    value: QueueRepeatMode.TRACK,
                },
                {
                    name: 'queue',
                    value: QueueRepeatMode.QUEUE,
                },
                {
                    name: 'Autoplay',
                    value: QueueRepeatMode.AUTOPLAY,
                }
            )
        ),
    async execute(interaction) {
        const queue = useQueue(interaction.guild);

        if (!queue) {
            const noEmbed = new EmbedBuilder()
               .setTitle('No queue')
               .setColor(0x0099FF)
               .setDescription('There is no active queue.')
               .setTimestamp();
               await interaction.reply({ embeds: [noEmbed]});
        }

        const loopMode = interaction.options.getNumber('mode');

        queue.setRepeatMode(loopMode);

        const loopEmbed = new EmbedBuilder()
           .setTitle('Loop Mode Changed')
           .setDescription(`Loop mode has been changed to ${QueueRepeatMode[loopMode]}.`)
           .setColor(0x0099FF)
           .setTimestamp();
           await interaction.reply({ embeds: [loopEmbed]});
    }
}

module.exports.details = {
    name: 'loop',
    author: 'Vasilew__',
    icon: 'https://cdn.discordapp.com/avatars/365350852967399454/ce6e6e91fa887aa86e23ef356c9878fe',
    description: 'change the loop mode',
    usage: '/loop [mode]'
}