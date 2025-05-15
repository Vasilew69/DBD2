    const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");
    const db = require("../../database/db");

    module.exports = {
    data: new SlashCommandBuilder()
        .setName("sendembed")
        .setDescription("Send Embed Message to selected channel")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addChannelOption(option => option.setName('channel').setDescription('Channel to send embed').setRequired(true))
        .addStringOption(option => option.setName('embedtitle').setDescription('Title of the embed').setRequired(true))
        .addStringOption(option => option.setName('embeddescription').setDescription('Description of the embed').setRequired(true))
        .addStringOption(option => option.setName('embedcolor').setDescription('Color of the embed (hex)').setRequired(true))
        .addStringOption(option => option.setName('embedfooter').setDescription('Footer text').setRequired(false))
        .addStringOption(option => option.setName('embedauthor').setDescription('Author name').setRequired(false)),

    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
        const permEmbed = new EmbedBuilder()
            .setTitle("Permission Denied")
            .setDescription("You don't have permissions.")
            .setColor(0xFF0000);
        return interaction.reply({ embeds: [permEmbed], ephemeral: true });
        }

        const channel = interaction.options.getChannel("channel");
        const embedTitle = interaction.options.getString("embedtitle");
        const embedDescription = interaction.options.getString("embeddescription");
        const embedColor = interaction.options.getString("embedcolor");
        const embedFooter = interaction.options.getString("embedfooter");
        const embedAuthor = interaction.options.getString("embedauthor");
        const message = null
        const isEmbed = 1;

        let sentMessage;

        const embed = new EmbedBuilder()
        .setTitle(embedTitle)
        .setDescription(embedDescription)
        .setColor(embedColor);

        if (embedFooter) embed.setFooter({ text: embedFooter });
        if (embedAuthor) embed.setAuthor({ name: embedAuthor });

        sentMessage =await channel.send({ embeds: [embed] });
        await interaction.reply({ content: "Embed message sent successfully!", ephemeral: true });

        const messageId = sentMessage.id;
        const channelId = channel.id;
        const guildId = channel.guildId;
        const clientId = interaction.client.user.id;

        await db.execute(
  `INSERT INTO sendMessage
   (guild_id, channel_id, message, client_id, isEmbed, embed_title, embed_description, embed_color, embed_footer, embed_author, messageId)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  [
    guildId,
    channelId,
    message || null,
    clientId,
    isEmbed || 1,
    embedTitle || null,
    embedDescription || null,
    embedColor || null,
    embedFooter || null,
    embedAuthor || null,
    messageId || null,
  ]
);

await db.execute(
  `INSERT INTO message_history
   (guild_id, channel_id, message, client_id, isEmbed, embed_title, embed_description, embed_color, embed_footer, embed_author, messageId)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  [
    guildId,
    channelId,
    message || null,
    clientId,
    isEmbed || 1,
    embedTitle || null,
    embedDescription || null,
    embedColor || null,
    embedFooter || null,
    embedAuthor || null,
    messageId || null,
  ]
);

    }};

    module.exports.details = {
    name: "Send Embed Message",
    author: "Vasilew__",
    icon: "https://cdn.discordapp.com/avatars/1161409662269272135/1ac51b5bbca693172e69336bb35d77b0",
    description: "Sends a custom embed message to a channel",
    usage: "/sendembed @channel @embedTitle @embedDescription @embedColor [embedFooter] [embedAuthor]",
    };
