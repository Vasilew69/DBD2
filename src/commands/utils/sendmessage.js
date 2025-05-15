const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const db = require("../../database/db");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("sendmessage")
        .setDescription("Send a message to the channel")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(option => 
    option
      .setName("message")           // all lowercase, no spaces
      .setDescription("The message to send")  // valid string
      .setRequired(true)
)
        .addChannelOption(option => option.setName("channel").setDescription("The channel to send the message").setRequired(true)),
    async execute(interaction) {
        if (!interaction.member.permissions.has("ADMINISTRATOR")) {
            const permEmbed = new EmbedBuilder()
               .setTitle("Permission Denied")
               .setDescription("You don't have permissions.")
               .setColor(0x0099FF);
               return interaction.reply({ embeds: [permEmbed]});
        }

        if (!interaction.member.permissions.has("ADMINISTRATOR")) {
            const permEmbed = new EmbedBuilder()
               .setTitle("Permission Denied")
               .setDescription("You don't have permissions.")
               .setColor(0x0099FF);
               return interaction.reply({ embeds: [permEmbed]});
        }

        let sentMessage;
        const message = interaction.options.getString("message")
        const channel = interaction.options.getChannel("channel")
        const isEmbed = 0;
        const embedTitle = null
        const embedDescription = null
        const embedColor = null
        const embedFooter = null
        const embedAuthor = null


        sentMessage = await channel.send(message)

        const messageId = sentMessage.id;
        const channelId = channel.id;
        const guildId = channel.guildId;
        const clientId = interaction.client.user.id;

        await db.execute(
          "INSERT INTO sendMessage (guild_id, channel_id, message, client_id, isEmbed, embed_title, embed_description, embed_color, embed_footer, embed_author, messageId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
          [
            guildId,
            channelId,
            message,
            clientId,
            isEmbed,
            embedTitle || null,
            embedDescription || null,
            embedColor || null,
            embedFooter || null,
            embedAuthor || null,
            messageId || null,
          ]
        );

  await db.execute(
            "INSERT INTO message_history (guild_id, channel_id, message, client_id, isEmbed, embed_title, embed_description, embed_color, embed_footer, embed_author, messageId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [
    guildId,
    channelId,
    message,
    clientId,
    isEmbed || 0,
    embedTitle || null,
    message || null,
    embedColor || null,
    embedFooter || null,
    embedAuthor || null,
    messageId || null,
  ]
        );
        await interaction.reply("Message sent")
    }
}

module.exports.details = {
  name: "Send Message",
  author: "Vasilew__",
  icon: "https://cdn.discordapp.com/avatars/1161409662269272135/1ac51b5bbca693172e69336bb35d77b0",
  description: "Sends a custom message to a channel",
  usage: "/sendmessage @message @channel",
};