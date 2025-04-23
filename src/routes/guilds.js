const express = require('express');
const router = express.Router();
const { ensureAuthenticated, forwardAuthenticated } = require('../auth/auth');
const discord = require('../bot')
const dateformat = require('dateformat')
const number = require('easy-number-formatter')
const themes = "./configs/theme.json"
const jsonfile = require('jsonfile');
const db = require('../database/db');
const limiter = require('../index')

router.get('/guilds',ensureAuthenticated,async (req,res) =>{
    try {
    var theme = jsonfile.readFileSync(themes);
    const name = discord.client.user.username
    const [guilds] = await db.execute(`SELECT * FROM guilds WHERE bybot = '${name}'`)
    if (!guilds) {
        throw new Error("Guilds not found");
    }
    let guildsic = discord.client.guilds.cache.map(guild => {
        return {
        id: guild.id,
        iconURL: guild.iconURL({ dynamic: true, size: 128 }) // You can adjust size
        };
    });

    const guildIcons = {};
    guildsic.forEach(g => guildIcons[g.id] = g.iconURL);
    res.render('home/guilds',{
        guilds:guilds,
        profile:req.user,
        client:discord.client,
        dateformat:dateformat,
        number:number,
        guildIcons,
        theme:theme
    })
} catch (error) {
    console.error("❌ Route error:", error.message);
    error.status = 500;
    next(error); // Forward to your global 500 handler
}
})

router.post('/guilds/leave/:id', ensureAuthenticated, async(req,res) =>{
    try {
    discord.client.guilds.cache.get(req.params.id).leave().then(value => {
        req.flash('success', `Succesfully left guild "${value.name}"`)
        res.redirect('/guilds')
    })
    if(!discord.client.guilds.cache.get(req.params.id)) {
        throw new Error("Guild not found");
    }

} catch (error) {
    console.error("❌ Route error:", error.message);
    error.status = 500;
    next(error); // Forward to your global 500 handler
}
})
router.post('/guilds/player/:id', ensureAuthenticated, async(req,res) =>{
    try {
    const guildId = req.params.id
    if(!guildId) {
        throw new Error("Guild ID not found");
    }

    req.flash('success', `Succesfully selectd the guild ${guildId}`)
    res.redirect(`/player?guildId=${guildId}`)
} catch (error) {
    console.error("❌ Route error:", error.message);
    error.status = 500;
    next(error); // Forward to your global 500 handler
}
})

module.exports = router;