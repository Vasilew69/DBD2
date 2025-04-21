const express = require('express');
const router = express.Router();
const { getClient } = require('../bot');
const { ensureAuthenticated, forwardAuthenticated } = require('../auth/auth');
const passport = require('passport');
const { get } = require('request');

router.get('/', forwardAuthenticated, (req, res) => {
    const client = getClient();
    res.render('login/login',{
        user:client.user.username,
        avatar:client.user.avatarURL()
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