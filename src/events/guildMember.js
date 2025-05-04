const db = require('../database/db');

module.exports = (client) => {
  client.on('guildMemberAdd', async member => {
    const welcomeEnabled = await isWelcomeSystemEnabled(member.guild.id);
    if (!welcomeEnabled) return;

    const channelId = await getJoinChannelId(member.guild.id);
    const roleId = await getWelcomeRoleid(member.guild.id); // ✅ Fix: Pass guildId!

    if (!channelId && !roleId) {
      console.log(`No welcome channel or role configured for guild ${member.guild.name}`);
      return;
    }

    const channel = member.guild.channels.cache.get(channelId);
    const role = member.guild.roles.cache.get(roleId);

    if (channel) {
      const joinEmbed = {
        color: 0x00ff00, // Green color
        title: 'Member Joined',
        description: `${member.user.tag} has joined the server!`,
        thumbnail: {
          url: member.user.displayAvatarURL({ dynamic: true }),
        },
        fields: [
          {
            name: 'Welcome!',
            value: `Please welcome ${member.user.toString()} to the server!`,
          },
        ],
        timestamp: new Date(),
        footer: {
          text: `Member Count: ${member.guild.memberCount}`,
        },
      };

      try {
        await channel.send({ embeds: [joinEmbed] });
      } catch (error) {
        console.error(`Could not send join message to channel ${channelId}:`, error);
      }
    } else {
      console.error(`Configured welcome channel not found in guild ${member.guild.name}`);
    }

    if (role) {
      try {
        await member.roles.add(role);
      } catch (error) {
        console.error(`Could not assign role ${role.name} to ${member.user.tag}:`, error);
      }
    } else {
      console.error(`Configured welcome role not found in guild ${member.guild.name}`);
    }
  });

  client.on('guildMemberRemove', async member => {
    const welcomeEnabled = await isWelcomeSystemEnabled(member.guild.id);
    if (!welcomeEnabled) return;

    const channelId = await getLeaveChannelId(member.guild.id);

    if (!channelId) {
      console.log(`No leave channel configured for guild ${member.guild.name}`);
      return;
    }

    const channel = member.guild.channels.cache.get(channelId);

    if (!channel) {
      console.error(`Configured leave channel not found in guild ${member.guild.name}`);
      return;
    }

    const leaveEmbed = {
      color: 0xff0000, // Red color
      title: 'Member Left',
      description: `${member.user.tag} has left the server.`,
      thumbnail: {
        url: member.user.displayAvatarURL({ dynamic: true }),
      },
      fields: [
        {
          name: 'Goodbye!',
          value: `We're sad to see ${member.user.tag} go.`,
        },
      ],
      timestamp: new Date(),
      footer: {
        text: `Member Count: ${member.guild.memberCount}`,
      },
    };

    try {
      await channel.send({ embeds: [leaveEmbed] });
    } catch (error) {
      console.error(`Could not send leave message to channel ${channelId}:`, error);
    }
  });

  // --- Database Fetch Functions ---
  async function getJoinChannelId(guildId) {
    try {
      const [rows] = await db.execute(
        'SELECT welcomeChannel FROM guilds WHERE id = ?',
        [guildId]
      );
      return rows.length > 0 ? rows[0].welcomeChannel : null;
    } catch (error) {
      console.error(`Error fetching welcome channel for guild ${guildId}:`, error);
      return null;
    }
  }

  async function getLeaveChannelId(guildId) {
    try {
      const [rows] = await db.execute(
        'SELECT leaveChannel FROM guilds WHERE id = ?',
        [guildId]
      );
      return rows.length > 0 ? rows[0].leaveChannel : null;
    } catch (error) {
      console.error(`Error fetching leave channel for guild ${guildId}:`, error);
      return null;
    }
  }

  async function getWelcomeRoleid(guildId) {
    try {
      const [rows] = await db.execute(
        'SELECT welcomeRole FROM guilds WHERE id = ?',
        [guildId]
      );
      return rows.length > 0 ? rows[0].welcomeRole : null; // ✅ Fixed typo here too
    } catch (error) {
      console.error(`Error fetching welcome role for guild ${guildId}:`, error);
      return null;
    }
  }

  async function isWelcomeSystemEnabled(guildId) {
    try {
      const [rows] = await db.execute(
        'SELECT welcomeEnabled FROM guilds WHERE id = ?',
        [guildId]
      );
      if (rows.length > 0) {
        return rows[0].welcomeEnabled === 1; // or === true depending on your DB structure
      } else {
        return false;
      }
    } catch (error) {
      console.error(`Error checking welcome system for guild ${guildId}:`, error);
      return false;
    }
  }
};
