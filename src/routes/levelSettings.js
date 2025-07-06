const express = require("express");
const { ensureAuthenticated } = require("../auth/auth");
const router = express.Router();
const discord = require("../bot");
const themes = './configs/theme.json';
const jsonfile = require("jsonfile");
const db = require("../database/db");
const { getBotGuild } = require("../utils/getBotGuilds");
const { ChannelType } = require('discord.js');

router.get("/levels-settings", ensureAuthenticated, async (req, res, next) => {
    try {
        const guildId = req.query.guildId;
        const success = req.query.success ? "✅ Levels settings saved!" : null;
        const client = await discord.getClient();
        const theme = await jsonfile.readFile(themes);
        const [rows] = await db.execute("SELECT * FROM levels_settings WHERE guild_id = ?", [guildId]);

        const guild = await getBotGuild(guildId);
        if (!guild) {
            return res.status(404).send("Guild not found.");
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

        const savedSettings = rows[0] || {};

        if (savedSettings && savedSettings.level_roles) {
            try {
                savedSettings.level_roles = JSON.parse(savedSettings.level_roles);
            } catch (error) {
                console.error("Error parsing level_roles:", error);
                savedSettings.level_roles = {}; // Default to empty object on error
            }
        } else {
            savedSettings.level_roles = {};
        }

        res.render("home/levelSettings", {
            client: client,
            profile: req.user,
            theme: theme,
            channels: textChannels,
            settings: savedSettings,
            guildId: guildId,
            roles: roles,
            success
        });
    } catch (error) {
        console.error(error);
        error.status = 500;
        next(error);
    }
});

router.post("/levels-settings/save/:id", ensureAuthenticated, async (req, res, next) => {
    const levelsEnabled = req.body.levelsEnabled ? 1 : 0;
    const LevelUpMessage = req.body.levelUpMessage;
    const { guildId, xpPerMessage, xpPerLevel, levelUpChannel, levelRoles } = req.body;

    try {
        const [existingSettings] = await db.execute(
            "SELECT guild_id FROM levels_settings WHERE guild_id = ?",
            [guildId]
        );

        const levelRolesJSON = JSON.stringify(levelRoles || {}); // Stringify the levelRoles object

        console.log(levelRolesJSON);
        if (existingSettings.length > 0) {
            // Update existing settings
            await db.execute(
                "UPDATE levels_settings SET levelsEnabled = ?, xp_per_message = ?, xp_per_level = ?, level_up_channel = ?, custom_level_message = ?, level_roles = ? WHERE guild_id = ?",
                [
                    levelsEnabled,
                    xpPerMessage,
                    xpPerLevel,
                    levelUpChannel || null,
                    LevelUpMessage || 'Congratulations {user}, you reached level {level}!',
                    levelRolesJSON,
                    guildId,
                ]
            );
        } else {
            // Insert new settings
            await db.execute(
                "INSERT INTO levels_settings (guild_id, levelsEnabled, xp_per_message, xp_per_level, level_up_channel, custom_level_message, level_roles) VALUES (?, ?, ?, ?, ?, ?, ?)",
                [
                    guildId,
                    levelsEnabled,
                    xpPerMessage,
                    xpPerLevel,
                    levelUpChannel || null,
                    LevelUpMessage || 'Congratulations {user}, you reached level {level}!',
                    levelRolesJSON,
                ]
            );
        }
        res.redirect(`/levels-settings?guildId=${guildId}&success=true`);
    } catch (error) {
        console.error(error);
        error.status = 500;
        next(error);
    }
});

module.exports = router;