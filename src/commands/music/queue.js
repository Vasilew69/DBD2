const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { useQueue } = require("discord-player");

module.exports = {
    data: new SlashCommandBuilder()
    .setName('queue')
    .setDescription('Get the current queue'),

    async execute(interaction) {
        const queue = useQueue(interaction.guild)

        if (!queue) {
          const noqEmbed = new EmbedBuilder()
          .setTitle('No Queue')
          .setDescription('No active music queue on this server.')
          .setColor('#FF0000')
          return interaction.reply({ embeds: [noqEmbed],   });
        }

        const currentTrack = queue.currentTrack;

        const upcomingTracks = queue.tracks.toArray();

        const message = [
            `**Now Playing:** ${currentTrack.title} - ${currentTrack.author}`,
            '',
            '**Upcoming Tracks:**',
            ...upcomingTracks.map(
              (track, index) => `${index + 1}. ${track.title} - ${track.author}`,
            ),
          ].join('\n');

          const queEmbed = new EmbedBuilder()
         .setTitle('Current Queue')
         .setDescription(message)
         .setColor('#0099FF')
         .setTimestamp();


          interaction.reply({ embeds: [queEmbed],   });
    }

}

module.exports.details = {
  name: 'queue',
  description: 'Get the current queue',
  usage: 'queue',
  author: 'Vasilew__',
  icon: 'https://cdn.discordapp.com/avatars/743304456810143783/767440651641278464',
}