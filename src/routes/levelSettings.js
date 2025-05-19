const express = require("express");
const { ensureAuthenticated } = require("../auth/auth");
const router = express.Router();
const discord = require("../bot")
const themes = './configs/theme.json'
const jsonfile = require("jsonfile")
const db = require("../database/db")

router.get("level-settings", ensureAuthenticated, async( req, res, next) => {
    try {
    const guildId = req.query.params;
    const client = await discord.getClient();
    const profile = req.profile;
    const theme = await jsonfile.readFile(themes);
    const [rows] = await db.execute("SELECT * FROM levels_setttings WHERE guild_idd = ?", [guildId])

    const savedSettings = rows[0] || {};

    res.render("home/levelSettings", {
        client: client,
        profile: profile,
        theme: theme,
        settings: savedSettings,
        guildId: guildId,
    })
} catch (error) {
    console.error(error)
    error.status = 500;
    next(error);
}
});

module.exports = router;