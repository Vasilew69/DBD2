import { SlashCommandBuilder, PermissionsBitField, EmbedBuilder } from 'discord.js';
import {useMainPlayer} from 'discord-player';
 
// Define the play command
export const data = new SlashCommandBuilder()
  .setName('play') // Command name
  .setDescription('Play a song in a voice channel') // Command description
  .addStringOption(
    (option) =>
      option
        .setName('url') // Option name
        .setDescription('The song to play') // Option description
        .setRequired(true), // Make the option required
  );

// Define the execute function for the play command
export async function execute(interaction) {
  // Get the player instance and song query
  const player = useMainPlayer();
  const query = interaction.options.getString('url', true);
 
  // Get the voice channel of the user and check permissions
  const voiceChannel = interaction.member.voice.channel;
 
  if (!voiceChannel) {
    const voiceEmbed = new EmbedBuilder()
     .setTitle('Error')
     .setDescription('You need to be in a voice channel to play music!')
     .setColor(0x0099FF);
     return interaction.reply({ embeds: [voiceEmbed], ephemeral: false });

  }
 
  if (
    interaction.guild.members.me.voice.channel &&
    interaction.guild.members.me.voice.channel !== voiceChannel
  ) {
    const alEmbed = new EmbedBuilder()
     .setTitle('Error')
     .setDescription('I am already playing in a different voice channel!')
     .setColor(0x0099FF);
     return interaction.reply({ embeds: [alEmbed], ephemeral: false });
  }
 
  if (
    !voiceChannel
      .permissionsFor(interaction.guild.members.me)
      .has(PermissionsBitField.Flags.Connect)
  ) {
    const permEmbed = new EmbedBuilder()
     .setTitle('Error')
     .setDescription('I do not have permission to join your voice channel!')
     .setColor(0x0099FF);
     return interaction.reply({ embeds: [permEmbed], ephemeral: false });
  }
 
  if (
    !voiceChannel
      .permissionsFor(interaction.guild.members.me)
      .has(PermissionsBitField.Flags.Speak)
  ) {
    const spEmbed = new EmbedBuilder()
     .setTitle('Error')
     .setDescription('I do not have permission to speak in your voice channel!')
     .setColor(0x0099FF);
     return interaction.reply({ embeds: [spEmbed], ephemeral: false });
  }
 
  try {
    // Play the song in the voice channel
    const result = await player.play(voiceChannel, query, {
      nodeOptions: {
        metadata: { channel: interaction.channel }, // Store text channel as metadata on the queue
      },
    });
 
    // Reply to the user that the song has been added to the queue
    const addEmbed = new EmbedBuilder()
     .setTitle('Song Added')
     .setDescription(`Added: ${result.track.title}`)
     .setColor(0x0099FF);
    return interaction.reply({ embeds: [addEmbed], ephemeral: false });
  } catch (error) {
    // Handle any errors that occur
    console.error(error);
    const errEmbed = new EmbedBuilder()
     .setTitle('Error Playing Song')
     .setDescription(`An error occurred while playing the song: ${error.message}`)
     .setColor(0x0099FF);
     return interaction.reply({ embeds: [errEmbed], ephemeral: false });
  }
}
