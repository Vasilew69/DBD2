const db = require('../database/db.js');
const chalk = require("chalk");

module.exports = async function(client) {
    // Initial sync of all guilds and members
    async function syncGuildsAndMembers() {
      for (const [guildId, guild] of client.guilds.cache) {
        const bot = client.user.username;
        const created = guild.createdAt;
        const membercount = guild.memberCount;
        await db.query(`
          INSERT INTO guilds (id, name, icon, joined_at, ownerId, bybot, created_at, membercount)
          VALUES (?, ?, ?, NOW(), ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE name = VALUES(name), icon = VALUES(icon), ownerId = VALUES(ownerId), bybot = VALUES(bybot), created_at = VALUES(created_at), membercount = VALUES(membercount)
        `, [guild.id, guild.name, guild.icon, guild.ownerId, bot, created, membercount]);
 
        try {
          await guild.members.fetch(); // Ensure full cache
          for (const [memberId, member] of guild.members.cache) {
            await db.query(`
              INSERT INTO members (id, guild_id, username, discriminator, avatar, joined_at, guildname)
              VALUES (?, ?, ?, ?, ?, NOW(), ?)
              ON DUPLICATE KEY UPDATE username = VALUES(username), avatar = VALUES(avatar), guildname = VALUES(guildname)
            `, [
              member.id,
              guild.id,
              member.user.username,
              member.user.discriminator,
              member.user.avatar,
              guild.name,
            ]);
          }
        } catch (err) {
          console.error(`Failed to fetch members for guild ${guild.id}:`, err.message);
        }
      }
  
      console.log(chalk.green(chalk.bold("✅ Synced all guilds and members")));
    }
  
    // Event: New guild
    client.on("guildCreate", async (guild) => {
      await db.query(`
        INSERT INTO guilds (id, name, icon, joined_at)
        VALUES (?, ?, ?, NOW())
        ON DUPLICATE KEY UPDATE name = VALUES(name), icon = VALUES(icon)
      `, [guild.id, guild.name, guild.icon]);
    });
  
    // Event: Guild removed
    client.on("guildDelete", async (guild) => {
      await db.query(`DELETE FROM guilds WHERE id = ?`, [guild.id]);
    });
  
    // Event: New member
    client.on("guildMemberAdd", async (member) => {
      await db.query(`
        INSERT INTO members (id, guild_id, username, discriminator, avatar, joined_at)
        VALUES (?, ?, ?, ?, ?, NOW())
        ON DUPLICATE KEY UPDATE username = VALUES(username), avatar = VALUES(avatar)
      `, [
        member.id,
        member.guild.id,
        member.user.username,
        member.user.discriminator,
        member.user.avatar,
      ]);
    });
  
    // Event: Member left
    client.on("guildMemberRemove", async (member) => {
      await db.query(`DELETE FROM members WHERE id = ? AND guild_id = ?`, [member.id, member.guild.id]);
    });
  
    client.once("clientReady", async () => {
      console.log(chalk.blue(chalk.bold("🔄 Running full sync...")));
      await syncGuildsAndMembers();
    });
  }