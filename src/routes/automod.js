const express = require("express");
const router = express.Router();
const { getClient } = require("../bot");
const themes = './configs/theme.json';
const jsonfile = require('jsonfile');
const { ensureAuthenticated } = require("../auth/auth");
const db = require("../database/db");
const { getBotGuild } = require("../utils/getBotGuilds");
const { ChannelType } = require('discord.js');


router.get('/automod', ensureAuthenticated, async (req, res, next) => {
  try {
    const client = getClient();
  const success = req.query.success ? "✅ AutoMod saved!" : null;
  const guildId = req.query.guildId;
  const theme = await jsonfile.readFileSync(themes)
  const guild = await getBotGuild(guildId);
  if (!guild) {
    throw new Error(`Guild with ID ${guildId} not found or bot is not in the guild.`);
  }

  await guild.channels.fetch(); // Fetch fresh channels from Discord
      const textChannels = guild.channels.cache
        .filter(channel => channel.type === ChannelType.GuildText)
        .map(channel => ({
          id: channel.id,
          name: channel.name
        }));

  const roles = guild.roles.cache.map(role => ({
    id: role.id,
    name: role.name,
  }));

  var query1 = "SELECT * FROM automod_config WHERE guild_id = ?";

  const [settings] = await db.query(query1, [req.query.guildId], function(err, results, next) {
    if (err) {
      if(err){
        console.error("❌ Route error:", err.message);
        err.status = 500;
        next(err); // Forward to your global 500 handler
      }
    }
    return results;
  }) || {};

  settings.excludedRoles ??= [];
  settings.customWords ??= [];
  
  // Ensure excludedRoles is always an array
  if (!Array.isArray(settings.excludedRoles)) {
    settings.excludedRoles = [];
  }

  if (!Array.isArray(settings.customWords)) {
    settings.customWords = [];
  }

  const savedSettings = settings[0] || {};

  res.render('home/automod', {
    client: client,
    profile: req.user,
    guildId,
    theme: theme,
    success,
    roles,
    settings: savedSettings,
    channels: textChannels
  });
} catch (error) {
    console.error("❌ Route error:", error.message);
    error.status = 500;
    next(error)
}
});
  
  router.post('/automod/save', ensureAuthenticated, async (req, res, next) => {
    try{
      const autoModEnabled = req.body.autoModEnabled ? 1 : 0
      const {
        guildId, excluded_roles, log_channel_id, delete_invites, delete_ips, spam_limit, spam_interval, action_on_trigger, badWords, antiSpam, excessiveMentions, customWords} = req.body;

        const [rows] = await db.execute(
          `SELECT * FROM automod_config WHERE guild_id = ? LIMIT 1`,
          [guildId]
        );
  
      await db.execute(
      `
      INSERT INTO automod_config (guild_id, excluded_roles, log_channel_id, delete_invites, delete_ips, spam_limit, spam_interval, action_on_trigger, badWords, antiSpam, excessiveMentions, autoModEnabled, customWords)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
      excluded_roles = VALUES(excluded_roles),
      log_channel_id = VALUES(log_channel_id),
      delete_invites = VALUES(delete_invites),
      delete_ips = VALUES(delete_ips),
      spam_limit = VALUES(spam_limit),
      spam_interval = VALUES(spam_interval),
      action_on_trigger = VALUES(action_on_trigger),
      autoModEnabled = VALUES(autoModEnabled),
      customWords = VALUES(customWords),
      badWords = VALUES(badWords),
      antiSpam = VALUES(antiSpam),
      excessiveMentions = VALUES(excessiveMentions)
    `,
      [
        guildId,
        JSON.stringify(excluded_roles || []),
        log_channel_id || null,
        delete_invites ? 1 : 0,
        delete_ips ? 1 : 0,
        spam_limit ? parseInt(spam_limit) : null,
        spam_interval ? parseInt(spam_interval) : null,
        action_on_trigger,
        badWords ? 1 : 0,
        antiSpam ? 1 : 0 ,
        excessiveMentions ? 1 : 0,
        autoModEnabled,
        customWords || null,
      ]
    );
  
    res.redirect(`/automod?guildId=${guildId}&success=true`);
  } catch (error) {
      console.error("❌ Route error:", error.message);
      error.status = 500;
      next(error)
  }
  });

module.exports = router;