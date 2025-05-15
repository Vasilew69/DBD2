const express = require('express');
const db = require('../database/db')
const router = express.Router();
const themes = "../src/configs/theme.json";
const jsonfile = require('jsonfile');
const { getClient } = require('../bot');
const { ensureAuthenticated } = require('../auth/auth');
const { getBotGuild } = require('../utils/getBotGuilds');
const { ChannelType } = require('discord.js');

router.get('/history', ensureAuthenticated, async (req, res, next) => {
  try {
    const client = await getClient();
    const guildId = req.query.guildId;
    const theme = jsonfile.readFileSync(themes);
    const page = parseInt(req.query.page) || 1;
    const limit = 25;
    const offset = (page - 1) * limit;
    const type = req.query.type || 'all';
  
    var baseQuery = "SELECT * FROM logs WHERE guildid = ?";
    var countQuery = "SELECT COUNT(*) as count FROM logs WHERE guildid = ?";
    const params = [guildId];
  
    if (type !== 'all') {
      baseQuery += ' WHERE type = ?';
      countQuery += ' WHERE type = ?';
      params.push(type);
    }
  
    baseQuery += ' ORDER BY timestamp DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);
    const guild = await getBotGuild(guildId);

    await guild.channels.fetch();
    const textChannels = guild.channels.cache
          .filter(channel => channel.type === ChannelType.GuildText)
          .map(channel => ({
            id: channel.id,
            name: channel.name
          }));
  
    const [results] = await db.query(baseQuery, params, function(err, result, next) {
      if(err){
        console.error("❌ Route error:", err.message);
        err.status = 500;
        next(err); // Forward to your global 500 handler
      }
      return result;
    });
    const [[{ count }]] = await db.query(countQuery, [guildId], function(err, result, next) {
      if(err){
        console.error("❌ Route error:", err.message);
        err.status = 500;
        next(err); // Forward to your global 500 handler
      }
      return result;
  });
  
    const totalPages = Math.ceil(count / limit);

    if(!results) {
      throw new Error("❌ Route error: No logs found.");
    }
  
   res.render('home/history', {
                profile: req.user,
                client: client,
                theme: theme,
                logs: results,
                currentPage: page,
                totalPages,
                selectedType: type.Date,
                guild: guildId,
                channels: textChannels
    });
    } catch (error) {
      console.error("❌ Route error:", error.message);
      error.status = 500;
      next(error); // Forward to your global 500 handler
    }
})

router.post('/clear/:id', ensureAuthenticated, async (req, res, next) => {
  try {
  const guildId = req.params.id;
  var delquery = "DELETE FROM logs WHERE guildId = ?";
  await db.query(delquery, [guildId], function(err, result, next) {
    if(err){
      console.error("❌ Route error:", err.message);
      err.status = 500;
      next(err); // Forward to your global 500 handler
    }
    return result;
  });
  res.redirect(`/history?guildId=${guildId}`);
  } catch (error) {
    console.error("❌ Route error:", error.message);
    error.status = 500;
    next(error);
  }
})

router.post('/add/:id', ensureAuthenticated, async (req, res, next) => {
  try {
    const guildId = req.params.id;
    const {id, username, userId, content, type, guildname} = req.body
    const timestamp = new Date();
    await db.execute('INSERT INTO logs (userId, username, content, type, guildname, guildId) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, username, content, type, guildname, guildId]);
    res.redirect(`/history?guildId=${guildId}`);
    } catch (error) {
      console.error("❌ Route error:", error.message);
      error.status = 500;
      next(error);
    }
})

  
module.exports = router;