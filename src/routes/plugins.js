const express = require('express');
const { ensureAuthenticated } = require('../auth/auth');
const jsonfile = require('jsonfile');
const { getClient } = require('../bot');
const router = express.Router();
const themes = "./configs/theme.json";
const dateformat = require('dateformat')

router.get('/plugins', ensureAuthenticated, async (req, res, next) => {
    try {
      const client = getClient();
      const guildId = req.query.guildId;
      const theme = jsonfile.readFileSync(themes);
  
      let guildinfo = client.guilds.cache.get(guildId);
      if (!guildinfo) {
        guildinfo = await client.guilds.fetch(guildId);
      }
  
      if (!guildinfo) {
        return res.status(404).send('Guild not found.');
      }
  
      res.render('home/plugins', {
        theme: theme,
        client: client,
        profile: req.user,
        guild: guildinfo,
        dateformat: dateformat
      });
    } catch (error) {
      console.error("❌ Route error:", error.message);
      error.status = 500;
      next(error);
    }
  });

router.post('/plugins/player/:id', ensureAuthenticated, async (req, res, next) => {
  try {
    const guildId = req.params.id;
    res.redirect(`/player?guildId=${guildId}`)
  } catch (error) {
    console.error("❌ Route error:", error.message);
    error.status = 500;
    next(error);
  }
})

router.post('/plugins/members/:id', ensureAuthenticated, async (req, res, next) => {
  try {
    const guildId = req.params.id;
    res.redirect(`/members?guildId=${guildId}`)
  } catch (error) {
    console.error("❌ Route error:", error.message);
    error.status = 500;
    next(error);
  }
})

router.post('/plugins/history/:id', ensureAuthenticated, async (req, res, next) => {
  try {
    const guildId = req.params.id;
    res.redirect(`/history?guildId=${guildId}`)
  } catch (error) {
    console.error("❌ Route error:", error.message);
    error.status = 500;
    next(error);
  }
})

router.post('/plugins/welcome/:id', ensureAuthenticated, async (req, res, next) => {
  try {
  const guildId = req.params.id;
  res.redirect(`/welcome?guildId=${guildId}`)
  } catch (error) {
    console.error("❌ Route error:", error.message);
    error.status = 500;
    next(error);
  }
})

router.post('/plugins/reactionroles/:id', ensureAuthenticated, async (req, res, next) => {
  try {
    const guildId = req.params.id;
    res.redirect(`/reactionroles?guildId=${guildId}`)
  } catch (error) {
    console.error("❌ Route error:", error.message);
    error.status = 500;
    next(error);
  }
});

router.post('/plugins/automod/:id', ensureAuthenticated, async (req, res, next) => {
  try {
    const guildId = req.params.id;
    res.redirect(`/automod?guildId=${guildId}`)
  } catch (error) {
    console.error("❌ Route error:", error.message);
    error.status = 500;
    next(error);
  }
});

module.exports = router;