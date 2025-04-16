const db = require('../database/db.js');

module.exports = async function(client) {
    // Initial sync of all guilds and members
    async function syncGuildsAndMembers() {
      for (const [guildId, guild] of client.guilds.cache) {
        await db.query(`
          INSERT INTO guilds (id, name, icon, joined_at, ownerId)
          VALUES (?, ?, ?, NOW(), ?)
          ON DUPLICATE KEY UPDATE name = VALUES(name), icon = VALUES(icon), ownerId = VALUES(ownerId)
        `, [guild.id, guild.name, guild.icon, guild.ownerId]);
  
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
  
      console.log("✅ Synced all guilds and members");
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
  
    client.once("ready", async () => {
      console.log("🔄 Running full sync...");
      await syncGuildsAndMembers();
    });
  }