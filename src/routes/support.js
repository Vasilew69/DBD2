const express = require('express');
const router = express.Router();
const discord = require('../bot')
const { ensureAuthenticated, forwardAuthenticated } = require('../auth/auth');
const themes = "./configs/theme.json"
const jsonfile = require('jsonfile')

router.get('/support', ensureAuthenticated,async (req, res, next) => {
    try {
        const client = await discord.getClient();
    var theme = jsonfile.readFileSync(themes);
    res.render('home/support',{
        profile:req.user,
        client:client,
        theme:theme
    })
} catch (error) {
    console.error("❌ Route error:", error.message);
    error.status = 500;
    next(error);
}
})

module.exports = router;