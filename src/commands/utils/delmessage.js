const {SlashCommandBuilder, EmbedBuilder, PermissionsBitField} = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
    .setName('deletemessage')
    .setDescription('Delete a message')
    .addStringOption(option =>
        option.setName('message_id').setDescription('The ID of the message to delete').setRequired(true)),
    async execute(interaction, client) {
        const messageId = interaction.options.getString("message_id");

        try {

            const targetMessage = await interaction.channel.messages.fetch(
              messageId
            );
            await targetMessage.delete();
            await interaction.reply({content: `Message deleted: ${targetMessage.content}`});
            await db.query('DELETE FROM sendMessage WHERE messageId = ?', [messageId]);
            await db.query('DELETE FROM message_history WHERE messageId = ?', [messageId]);
        } catch (error) {
            console.error(error);
            await interaction.reply({content: 'An error occurred while deleting the message.'});
        }
    }
};

module.exports.details = {
  name: "Delete Message",
  description: "Deletes a message",
  icon: 'https://cdn.discordapp.com/avatars/1161409662269272135/1ac51b5bbca693172e69336bb35d77b0',
  author: "Vasilew__",
  usage: "/deletemessage <message_id>",
};