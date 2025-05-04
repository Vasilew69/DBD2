const express = require("express");
const router = express.Router();
const db = require("../database/db"); // Your MySQL wrapper
const { getBotGuild } = require("../utils/getBotGuilds");
const { ensureAuthenticated } = require("../auth/auth");
const { getClient} = require("../bot")
const themes = "../src/configs/theme.json";
const jsonfile = require("jsonfile");
const { ChannelType } = require('discord.js');

router.get("/welcome", ensureAuthenticated, async (req, res, next) => {
  try {
    const client = getClient();
    const success = req.query.success ? "✅ Welcome settings saved!" : null;
    const guildId = req.query.guildId;
    const theme = jsonfile.readFileSync(themes);

    if (!guildId) {
      throw new Error("No guildId provided");
    }

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
      name: role.name
    }));

    // Fetch saved settings from database
    const [rows] = await db.execute(
      `SELECT welcomeChannel, leaveChannel, welcomeRole, welcomeMessage, leaveMessage, welcomeEnabled FROM guilds WHERE id = ?`,
      [guildId]
    );

    const savedSettings = rows[0] || {}; // fallback to empty object if not found

    res.render("home/welcome", {
      client: client,
      profile: req.user,
      config: savedSettings,
      channels: textChannels,
      roles: roles,
      theme: theme,
      success: success,
      guildId: guildId,
    });
  } catch (error) {
    console.error("❌ Route error:", error.message);
    error.status = 500;
    next(error);
  }
});

router.post("/welcome", ensureAuthenticated, async (req, res, next) => {
  try {
    const { welcomeEnabled, welcomeChannel, leaveChannel, welcomeRole, welcomeMessage, leaveMessage } = req.body;
      const guildId = req.body.guildId;

      // Validate guildId
      if (!guildId) {
          console.error("❌ No guildId found in the request.");
          return res.status(400).send("Guild ID is required.");
      }

      const guild = await getBotGuild(guildId); 

      if (!guild) {
          console.error(`❌ Guild with ID ${guildId} not found or bot is not in the guild.`);
          return res.status(500).send(`Guild with ID ${guildId} not found or bot is not in the guild.`);
      }

      // Fetch channels to ensure they are available
      try {
          await guild.channels.fetch();  // Fetch the channels to ensure they are up-to-date
      } catch (err) {
          console.error("❌ Error fetching channels:", err.message);
          return res.status(500).send("Error fetching channels.");
      }

      await db.execute(
        `UPDATE guilds 
         SET welcomeChannel = ?, 
             leaveChannel = ?, 
             welcomeRole = ?, 
             welcomeMessage = ?, 
             leaveMessage = ?, 
             welcomeEnabled = ?  
         WHERE id = ?`,
        [
          welcomeChannel || null,  // Default to null if not provided
          leaveChannel || null,    // Default to null if not provided
          welcomeRole || null,     // Default to null if not provided
          welcomeMessage || '',    // Default to empty string if not provided
          leaveMessage || '',      // Default to empty string if not provided
          welcomeEnabled ? 1 : 0,  // Ensure this is a boolean (0 or 1)
          guildId
        ]
      );

      res.redirect(`/welcome?guildId=${guildId}&success=true`);
  } catch (error) {
      console.error("❌ Route error:", error.message);
      error.status = 500;
      next(error);
  }
});


module.exports = router;
