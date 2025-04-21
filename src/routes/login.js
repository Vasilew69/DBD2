const express = require('express');
const router = express.Router();
const discord = require('../bot')
const { ensureAuthenticated, forwardAuthenticated } = require('../auth/auth');
const passport = require('passport');
const limiter = require('../index')

router.get('/', forwardAuthenticated, (req, res) => {
    router.use(limiter)
    res.render('login/login',{
        user:discord.client.user.username,
        avatar:discord.client.user.avatarURL()
    })
})

router.get('/api', forwardAuthenticated,(req,res, next)=>{
    router.use(limiter)
    passport.authenticate('discord', {
        successRedirect: '/home',
        failureRedirect: '/login',
        failureFlash: true
      })(req, res, next);
})

module.exports = router;