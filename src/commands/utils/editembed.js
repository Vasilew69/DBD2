const {SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder} = require('discord.js');
const db = require('../../database/db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName("editembed")
    .setDescription("Edits the embed of a message")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption((option) =>
      option
        .setName("message_id")
        .setDescription("The message ID")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option.setName("title").setDescription("title of the embed").setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("desctription")
        .setDescription("description of the embed")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("color")
        .setDescription("The color of the embed")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("author")
        .setDescription("The author of the embed")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("foother")
        .setDescription("The footer of the embed")
        .setRequired(true)
    ),
  async execute(interaction, client) {
    const messageid = interaction.options.getString("message_id");
    const title = interaction.options.getString("title");
    const description = interaction.options.getString("desctription");
    const color = interaction.options.getString("color");
    const author = interaction.options.getString("author");
    const foother = interaction.options.getString("foother");
    const isEmbed = 1;
    const clientId = client.user.id;
    const message = null;
    if (
      !interaction.member.permissions.has(PermissionFlagsBits.Administrator)
    ) {
      const permEmbed = new EmbedBuilder()
        .setTitle("Permission Denied")
        .setDescription("You don't have permissions.")
        .setColor(0xff0000);
      return interaction.reply({ embeds: [permEmbed] });
    }

    const [rows] = await db.query(
  "SELECT * FROM sendMessage WHERE messageId = ?",
  [messageid]
);
if (!rows || rows.length === 0) {
  return interaction.reply({ content: "Message ID not found in database."});
}
const dbresults = rows[0];
const channelId = dbresults.channel_id;

    try {
      const channel = await client.channels.fetch(channelId).catch(() => null);

      if (!channel) {
  return interaction.reply({ content: "Channel not found."});
}
await channel.messages.delete(messageid).catch(() => {});
      await db.query("DELETE FROM sendMessage WHERE messageId = ?", [
        messageid,
      ]);
      await db.query("DELETE FROM message_history WHERE messageId = ?", [
        messageid,
      ]);

      const editembed = new EmbedBuilder()
  .setTitle(title)
  .setDescription(description)
  .setColor(color)
  .setAuthor({ name: author })
  .setFooter({ text: foother });

    
    const sentMessage = await channel.send({ embeds: [editembed] });
const newMessageId = sentMessage.id;

    const guildId = interaction.guildId;
    await db.execute(
            "INSERT INTO sendMessage (guild_id, channel_id, message, client_id, isEmbed, embed_title, embed_description, embed_color, embed_footer, embed_author, messageId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [
    guildId,
    channelId,
    message || null,
    clientId,
    isEmbed,
    title || null,
    description || null,
    color || null,
    foother || null,
    author || null,
    newMessageId || null,
  ]
        );

  await db.execute(
    "INSERT INTO message_history (guild_id, channel_id, message, client_id, isEmbed, embed_title, embed_description, embed_color, embed_footer, embed_author, messageId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [
      guildId,
      channelId,
      message || null,
      clientId,
      isEmbed,
      title || null,
      description || null,
      color || null,
      foother || null,
      author || null,
      newMessageId || null,
    ]
  );
      const sucEmbed = new EmbedBuilder()
        .setTitle("Success")
        .setDescription("Embed edited.")
        .setColor(0x00ff00)
      interaction.reply({ embeds: [sucEmbed] });
    } catch (error) {
      const errEmbed = new EmbedBuilder()
      .setTitle('Error')
      .setDescription(error)
      .setAuthor('Bot')
      .setColor(0xff0000)
      interaction.reply({ embeds: [errEmbed] });
    }
  },
};

module.exports.details = {
  name: "Edit Embed",
  description: "Edits the embed of a message",
  icon: 'https://cdn.discordapp.com/avatars/1161409662269272135/1ac51b5bbca693172e69336bb35d77b0',
  author: "Vasilew__",
  usage: "/editembed <message_id> <title> <description> <color> <footer> <author> <new_message_id>",
};