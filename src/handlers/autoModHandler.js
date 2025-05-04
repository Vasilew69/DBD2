const db = require("../database/db");

module.exports = async (client) => {
  const spamMap = new Map();

  client.on("messageCreate", async (message) => {
    try{
    const [rows] = await db.execute(`SELECT * FROM automod_config WHERE guild_id = ?`, [message.guild.id]);
    if (!rows.length || rows[0].autoModEnabled == 0) return;
    if (message.author.bot || !message.guild) return;

    const settings = rows[0];
    const member = message.guild.members.cache.get(message.author.id);
    const excludedRoles = JSON.parse(settings.excluded_roles || "[]");

    if (excludedRoles.some((r) => member.roles.cache.has(r))) return;

    const inviteRegex = /(discord\.gg|discord\.com\/invite)/i;
    const ipRegex = /(?:\d{1,3}\.){3}\d{1,3}/;

    let actionTake = null;
    const now = Date.now();

    // Anti-invite
    if (parseInt(settings.delete_invites) === 1 && inviteRegex.test(message.content)) {
      try {
        await message.delete();
        actionTake = "Invite link detected";
      } catch (e) {
        console.warn("Failed to delete invite message:", e);
      }
    }

    // Anti-IP
    if (!actionTake && parseInt(settings.delete_ips) === 1 && ipRegex.test(message.content)) {
      try {
        await message.delete();
        actionTake = "IP address detected";
      } catch (e) {
        console.warn("Failed to delete IP message:", e);
      }
    }

    // Anti-spam
    if (!actionTake && parseInt(settings.antiSpam) === 1 && settings.spam_limit && settings.spam_interval) {
      const userKey = `${message.guild.id}:${message.author.id}`;
      const timestamps = (spamMap.get(userKey) || []).filter((t) => now - t < settings.spam_interval);
      timestamps.push(now);
      spamMap.set(userKey, timestamps);

      if (timestamps.length >= parseInt(settings.spam_limit)) {
        try {
          await message.delete();

        } catch (e) {
          console.warn("Failed to delete spam message:", e);
        }
        actionTake = "Spam detected";
        spamMap.set(userKey, []); // reset after trigger
      }
    }

    async function takeAction(member, action, reason = "AutoMod triggered") {
      switch (action) {
        case "warn":
          // You can log this in DB or send a DM instead
          await member.send(`You were warned for: ${reason}`).catch(() => {});
          break;
        case "mute":
          await member.timeout(10 * 60 * 1000, reason).catch(console.error); // 10 minutes
          break;
        case "kick":
          await member.kick(reason).catch(console.error);
          break;
        case "ban":
          await member.ban({ reason }).catch(console.error);
          break;
        default:
          break;
      }
    }

    // Log and take action
    if (actionTake && settings.log_channel_id && settings.action_on_trigger) {
      const logChannel = message.guild.channels.cache.get(settings.log_channel_id);
      if (logChannel) {
        logChannel.send({
          embeds: [
            {
              title: "AutoMod Action",
              description: `**Action:** ${settings.action_on_trigger?.toUpperCase() || 'None'}\n**Reason:** ${actionTake}\n**User:** <@${message.author.id}>`,
              color: 0xff0000,
              timestamp: new Date(),
            },
          ],
        });
        await takeAction(member, settings.action_on_trigger, actionTake);
        await db.execute(`INSERT INTO audit_logs (guild_id, user_id, action_type, content, target_id, timestamp) VALUES (?, ?, ?, ?, ?, ?)`, [message.guild.id, message.author.id, actionTake, message.content, message.id, new Date()])
      }
    }
  } catch (error) {
    console.error("Error in autoModHandler:", error);
  }
  });
};
