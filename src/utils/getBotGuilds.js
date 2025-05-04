const discord = require("../bot");
const client = discord.getClient();

/**
 * Retrieves the guild object from cache or fetches if not cached.
 * @param {string} guildId - The ID of the guild.
 * @returns {Promise<Guild|null>}
 */
async function getBotGuild(guildId) {
    try {
        // First check the cache
        let guild = client.guilds.cache.get(guildId);
        
        // If not cached, fetch it
        if (!guild) {
            guild = await client.guilds.fetch(guildId, { force: true });
        }

        return guild;
    } catch (error) {
        console.error(`Failed to get guild %s${guildId}:`, error);
        return null;
    }
}

module.exports = { getBotGuild };
