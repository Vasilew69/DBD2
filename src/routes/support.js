const express = require('express');
const router = express.Router();
const discord = require('../bot')
const { ensureAuthenticated, forwardAuthenticated } = require('../auth/auth');
const themes = "./configs/theme.json"
const jsonfile = require('jsonfile')
const limiter = require('../index')

router.get('/support', ensureAuthenticated,async (req, res) => {
    try {
    var theme = jsonfile.readFileSync(themes);
    res.render('home/support',{
        profile:req.user,
        client:discord.client,
        theme:theme
    })
} catch (error) {
    console.error("❌ Route error:", error.message);
    error.status = 500;
    next(error);
}
})

module.exports = router;