const express = require('express');
const router = express.Router();
const { getClient } = require('../bot');
const { ensureAuthenticated, forwardAuthenticated } = require('../auth/auth');
const passport = require('passport');

router.get('/', forwardAuthenticated, async(req, res, next) => {
    try{
    const client = await getClient();
    res.render('login/login',{
        user:client.user.username,
        avatar:client.user.avatarURL()
    })
} catch (error) {
    console.error(error)
    error.status =500
    next(error)
}
})

router.get('/api', forwardAuthenticated,(req,res, next)=>{
    passport.authenticate('discord', {
        successRedirect: '/home',
        failureRedirect: '/login',
        failureFlash: true
      })(req, res, next);
})

module.exports = router;