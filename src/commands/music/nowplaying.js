const { useQueue } = require("discord-player");
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('nowplaying')
        .setDescription('Display the currently playing song'),
    async execute(interaction) {
        const queue = useQueue(interaction.guild);
 
  if (!queue) {
    const noEmbed = new EmbedBuilder()
       .setTitle('No active queue')
       .setColor(0x0099FF)
       .setDescription('There is no queue active on this server.')
       .setTimestamp();
        return interaction.reply({ embeds: [noEmbed] });
  }
 
  // Get the currently playing song
  const currentSong = queue.currentTrack;
 
  // Check if there is a song playing
  if (!currentSong) {
    const noCEmbed = new EmbedBuilder()
     .setTitle('No song playing')
     .setColor(0x0099FF)
     .setDescription('No song is currently playing.')
     .setTimestamp();
      return interaction.reply({ embeds: [noCEmbed] });

  }
 
  // Send the currently playing song information
  const playingEmbed = new EmbedBuilder()
     .setTitle('Now Playing')
     .setColor(0x0099FF)
     .setDescription(`Now playing: ${currentSong.name}`)
     .setThumbnail(currentSong.thumbnail)
     .addFields(
        { name: 'Duration', value: `${Math.floor(currentSong.duration / 60)}:${currentSong.duration % 60 < 10? '0' : ''}${currentSong.duration % 60}` },
        { name: 'Requested by', value: currentSong.requester.tag },
        { name: 'Progress', value: `${Math.floor((currentSong.position / currentSong.duration) * 100)}%` },
      )
     .setTimestamp();
 
  interaction.reply({ embeds: [playingEmbed] });

}
    }

module.exports.details = {
  name: 'NowPlaying',
  description: 'Displays the currently playing song',
  icon: 'https://cdn.discordapp.com/avatars/1161409662269272135/1ac51b5bbca693172e69336bb35d77b0',
  author: 'Vasilew',
  usage: '/nowplaying'
}
