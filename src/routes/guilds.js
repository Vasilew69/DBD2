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
    var theme = jsonfile.readFileSync(themes);
    const name = discord.client.user.username
    const [guilds] = await db.execute(`SELECT * FROM guilds WHERE bybot = '${name}'`)
    let guildsic = discord.client.guilds.cache.map(guild => guild);
    res.render('home/guilds',{
        guilds:guilds,
        profile:req.user,
        client:discord.client,
        dateformat:dateformat,
        number:number,
        guildsic: guildsic,
        theme:theme
    })
})

router.post('/guilds/leave/:id', ensureAuthenticated,(req,res) =>{
    discord.client.guilds.cache.get(req.params.id).leave().then(value => {
        req.flash('success', `Succesfully left guild "${value.name}"`)
        res.redirect('/guilds')
    })
})
router.post('/guilds/player/:id', ensureAuthenticated,(req,res) =>{
    const guildId = req.params.id
    req.flash('success', `Succesfully selectd the guild ${guildId}`)
    res.redirect(`/player?guildId=${guildId}`)
})

module.exports = router;