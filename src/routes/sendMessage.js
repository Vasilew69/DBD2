const express = require("express");
const { ensureAuthenticated } = require("../auth/auth");
const { getClient } = require("../bot");
const jsonfile = require("jsonfile");
const { getBotGuild } = require("../utils/getBotGuilds");
const router = express.Router();
const themes = './configs/theme.json';
const { ChannelType, EmbedBuilder } = require('discord.js');
const db = require("../database/db");

router.get("/sendmessage", ensureAuthenticated, async (req, res, next) => {
try{
    const client = await getClient();
    const theme = await jsonfile.readFileSync(themes);
    const success = req.query.success ? "✅ Message sent succesfuly!" : null;
    const successe = req.query.sucesse ? "✅ Message edited succesfuly!" : null;
    const successd = req.query.sucessd ? "✅ Message deleted succesfuly!" : null;
    const guildId = req.query.guildId;
    var query = 'SELECT * FROM sendMessage WHERE guild_id = ?';

    if(!guildId) throw new Error('GUILD_ID is required!');
    
    const guild = await getBotGuild(guildId);

    await guild.channels.fetch()
 
     const textChannels = guild.channels.cache
          .filter(channel => channel.type === ChannelType.GuildText)
          .map(channel => ({ id: channel.id, name: channel.name }));
    
    const [sendMessage] = await db.query(query, [guildId], function(err, result, next) {
        if (err) {
            console.error(err);
            err.statsus(500);
            next(err)
        };
        return result;
    })

    const [history] = await db.query(
        "SELECT * FROM message_history WHERE guild_id = ? ORDER BY sent_at DESC",
        [guildId]
    );

    const savedSettings = sendMessage[0] || {};

    res.render("home/sendMessage", {
      profile: req.user,
      theme: theme,
      client: client,
      success,
      successe,
      successd,
      guildId,
      sMessage: savedSettings,
      channels: textChannels,
      history,
      guild
    });
} catch (error) {
    console.error(error);
    error.status = 500
    next(error);
}
})


router.post("/sendmessage/save", ensureAuthenticated, async (req, res, next) => {
    const client = await getClient();
    const guildId = req.body.guildId;
    const schannel = req.body.channel;
    const message = req.body.messageContent;
    const clientId = client.user.id;
    const isEmbed = req.body.isEmbed ? 1 : 0;
    const embedTitle = req.body.embedTitle;
    const embedColor = req.body.embedColor;
    const embedFooter = req.body.embedFooter;
    const embedAuthor = req.body.embedAuthor;

    try{
        if (!guildId) {
            throw new Error('GUILD_ID is required!');
        }

        if (!schannel) {
            throw new Error('CHANNEL_ID is required!');
        }

        if (!message) {
            throw new Error('MESSAGE_CONTENT is required!');
        }
                
        const guild = await getBotGuild(guildId);
        const channel = await guild.channels.fetch(schannel);

        let sentMessage;

        if (isEmbed == 1) {
            const embed = new EmbedBuilder()
            .setTitle(embedTitle)
            .setDescription(message)
            .setColor(embedColor)
            .setFooter({ text: embedFooter })
            .setAuthor({ name: embedAuthor })

        sentMessage = await channel.send({ embeds: [embed] });
        } else {
        sentMessage = await channel.send(message);
        }

        const messageId = sentMessage.id;

        await db.execute(
            "INSERT INTO sendMessage (guild_id, channel_id, message, client_id, isEmbed, embed_title, embed_description, embed_color, embed_footer, embed_author, messageId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [
    guildId,
    schannel,
    message,
    clientId,
    isEmbed,
    embedTitle || null,
    message || null,
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
    schannel,
    message,
    clientId,
    isEmbed,
    embedTitle || null,
    message || null,
    embedColor || null,
    embedFooter || null,
    embedAuthor || null,
    messageId || null,
  ]
        );

        res.redirect(`/sendmessage?guildId=${guildId}&success=true`)
    } catch (error) {
        console.error(error);
        error.status = 500
        next(error);
    }
});

router.post("/sendmessage/edit/:id", ensureAuthenticated, async (req, res, next) => {
    try{
        const client = await getClient();
        const messageId = req.body.messageId;
        const channelId = req.body.channelId;
        const guildId = req.body.guildId;
        const message = req.body.messageContent;
    const clientId = client.user.id;
    const isEmbed = req.body.isEmbed ? 1 : 0;
    const embedTitle = req.body.embedTitle;
    const embedColor = req.body.embedColor;
    const embedFooter = req.body.embedFooter;
    const embedAuthor = req.body.embedAuthor;
    const embedDescription = req.body.embedDescription;

    let sentMessage;
    const guild = await getBotGuild(guildId);
    if (!guild) return res.status(404).send("Guild not found.");

    const channel = await guild.channels.fetch(channelId);
    if (!channel || !channel.isTextBased()) return res.status(404).send("Channel not found or not text.");

    const messageSent = await channel.messages.fetch(messageId);
    if (!messageSent) return res.status(404).send("Message not found.");

    if (Number(isEmbed) === 1) {
    
    await messageSent.delete()

    await db.query('DELETE FROM sendMessage WHERE messageId = ?', [messageId]);
    await db.query('DELETE FROM message_history WHERE messageId = ?', [messageId]);

    const embed = new EmbedBuilder()
    .setColor(embedColor)
    .setTitle(embedTitle)
    .setFooter(embedFooter)
    .setAuthor(embedAuthor)
    .setDescription(embedDescription);

    sentMessage = await channel.send(embed)

    const newMessageId = sentMessage.id;
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
    newMessageId || null,
  ]
        );

  await db.execute(
            "INSERT INTO message_history (guild_id, channel_id, message, client_id, isEmbed, embed_title, embed_description, embed_color, embed_footer, embed_author, messageId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
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
    newMessageId || null,
  ]
        );

        res.redirect(`/sendmessage?guildId=${guildId}&successe=true`)
    } else {
        await messageSent.delete()

        await db.query('DELETE FROM sendMessage WHERE messageId = ?', [messageId]);
    await db.query('DELETE FROM message_history WHERE messageId = ?', [messageId]);
    sentMessage = await channel.send(message)

    const newMessageId = sentMessage.id;
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
    newMessageId || null,
  ]
        );

  await db.execute(
            "INSERT INTO message_history (guild_id, channel_id, message, client_id, isEmbed, embed_title, embed_description, embed_color, embed_footer, embed_author, messageId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
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
    newMessageId || null,
  ]
        );
        res.redirect(`/sendmessage?guildId=${guildId}&successe=true`)
    }

} catch (error) {
    console.error(error);
    error.status = 500;
    next(error);
};
});

router.post("/sendmessage/del/:id", ensureAuthenticated, async(req, res, next) => {
    const messageId = req.body.messageId;
    const channelId = req.body.channelId;
    const guildId = req.body.guildId;

    try {
        const guild = await getBotGuild(guildId);
    if (!guild) return res.status(404).send("Guild not found.");

    const channel = await guild.channels.fetch(channelId);
    if (!channel || !channel.isTextBased()) return res.status(404).send("Channel not found or not text.");

    const message = await channel.messages.fetch(messageId);
    if (!message) return res.status(404).send("Message not found.");
    
    await message.delete()

    await db.query('DELETE FROM sendMessage WHERE messageId = ?', [messageId]);
    await db.query('DELETE FROM message_history WHERE messageId = ?', [messageId]);

    res.redirect(`/sendmessage?guildId=${guildId}&successd=true`)
    } catch(error) {
        console.error(error);
        error.status = 500;
        next(error);
    }
});

module.exports = router;