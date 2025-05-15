const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../auth/auth');
const jsonfile = require('jsonfile');
const { getClient } = require('../bot');
const { getBotGuild } = require('../utils/getBotGuilds');
const db = require('../database/db');
const { ChannelType } = require('discord.js');

const themes = "./configs/theme.json";

router.get('/reactionroles', ensureAuthenticated, async (req, res, next) => {
  try {
    const client = await getClient();
    const guildId = req.query.guildId;
    const theme = jsonfile.readFileSync(themes);
    const success = req.query.success ? "✅ Reaction roles saved!" : null;

    if (!guildId) throw new Error("❌ No guildId provided");

    const guild = await getBotGuild(guildId);
    if (!guild) throw new Error(`Guild with ID ${guildId} not found or bot is not in the guild.`);

    await guild.channels.fetch();
    await guild.roles.fetch();

    const textChannels = guild.channels.cache
      .filter(channel => channel.type === ChannelType.GuildText)
      .map(channel => ({ id: channel.id, name: channel.name }));

    const roles = guild.roles.cache
      .filter(role => !role.managed && role.name !== '@everyone')
      .map(role => ({ id: role.id, name: role.name }));

    // Fetch existing reaction roles from DB
    const [reactionRoles] = await db.execute(
      `SELECT message_id, emoji, role_id, channel_id, reactionEnabled, message FROM reaction_roles WHERE guild_id = ?`,
      [guildId]
    );

    const savedSettings = reactionRoles[0] || {};

    res.render("home/reactionroles", {
      theme,
      profile: req.user,
      client: client,
      guild,
      textChannels,
      roles,
      reactionRoles: savedSettings,
      success: success,
      guildId: guildId,
    });
  } catch (error) {
    console.error("❌ ReactionRoles Route Error:", error.message);
    error.status = 500;
    next(error);
  }
});

router.post('/reactionroles/save', ensureAuthenticated, async (req, res, next) => {
  try {
    const { guildId, reactionChannel, messageContent, emoji, roleId, reactionEnabled } = req.body;

    if (!guildId || !reactionChannel || !messageContent || !emoji || !roleId) {
      throw new Error("Missing required fields.");
    }

    const guild = await client.guilds.fetch(guildId);
    const channel = await guild.channels.fetch(reactionChannel);
    const emojis = Array.isArray(emoji) ? emoji : [emoji];
    const roleIds = Array.isArray(roleId) ? roleId : [roleId];

    if (!channel || channel.type !== ChannelType.GuildText) {
      throw new Error("Invalid channel type");
    }

    // Check for existing reaction role message
    const [rows] = await db.execute(
      `SELECT message_id FROM reaction_roles WHERE guild_id = ? AND channel_id = ? LIMIT 1`,
      [guildId, reactionChannel]
    );

    let sentMessage;

    if (rows.length > 0) {
      // If reactionEnabled is false, delete the message
      const existingMessageId = rows[0].message_id;

      if (!reactionEnabled) {
        // Delete the reaction role message
        const existingMessage = await channel.messages.fetch(existingMessageId);
        await existingMessage.delete();  // Delete the message instead of editing
        await db.execute(
          `DELETE FROM reaction_roles WHERE guild_id = ? AND message_id = ?`,
          [guildId, existingMessageId]
        );
        return res.redirect(`/reactionroles?guildId=${guildId}&success=true`);
      }

      // Edit existing message if reactionEnabled is true
      try {
        const existingMessage = await channel.messages.fetch(existingMessageId);
        await existingMessage.edit(messageContent);
        sentMessage = existingMessage;

        // Remove old reactions
        await existingMessage.reactions.removeAll();
      } catch (err) {
        console.warn("⚠️ Failed to fetch or edit message. Sending new message instead.");
        sentMessage = await channel.send(messageContent);
      }

      // Delete old DB entries
      await db.execute(
        `DELETE FROM reaction_roles WHERE guild_id = ? AND message_id = ?`,
        [guildId, existingMessageId]
      );
    } else {
      // Send a new message if none exists
      sentMessage = await channel.send(messageContent);
    }

    // React with new emojis
    for (const e of emojis) {
      try {
        await sentMessage.react(e);
      } catch (err) {
        console.warn(`⚠️ Could not react with emoji "%s":`, String(e).replace(/%/g, '%%'), err.message);
      }
    }

    // Insert updated entries
    const insertPromises = emojis.map((e, i) => {
      return db.execute(
        `INSERT INTO reaction_roles (guild_id, channel_id, message_id, emoji, role_id, reactionEnabled, message)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          guildId,
          reactionChannel,
          sentMessage.id,
          e,
          roleIds[i],
          reactionEnabled ? 1 : 0,
          messageContent
        ]
      );
    });

    await Promise.all(insertPromises);

    res.redirect(`/reactionroles?guildId=${guildId}&success=true`);
  } catch (error) {
    console.error("❌ Error saving reaction roles:", error);
    next(error);
  }
});

module.exports = router;