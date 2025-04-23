const express = require('express');
const db = require('../database/db')
const router = express.Router();
const themes = "../src/configs/theme.json";
const jsonfile = require('jsonfile');
const { client } = require('../bot');
const { ensureAuthenticated } = require('../auth/auth');
const limiter = require('../index');
const passport = require('../auth/passport');
const { deserializeUser } = require('passport');

router.get('/history', ensureAuthenticated, async (req, res) => {
  try {
    const theme = jsonfile.readFileSync(themes);
    const page = parseInt(req.query.page) || 1;
    const limit = 25;
    const offset = (page - 1) * limit;
    const type = req.query.type || 'all';
  
    let baseQuery = 'SELECT * FROM logs';
    let countQuery = 'SELECT COUNT(*) as count FROM logs';
    const params = [];
  
    if (type !== 'all') {
      baseQuery += ' WHERE type = ?';
      countQuery += ' WHERE type = ?';
      params.push(type);
    }
  
    baseQuery += ' ORDER BY timestamp DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);
  
    const [results] = await db.query(baseQuery, params);
    const [[{ count }]] = await db.query(countQuery, type !== 'all' ? [type] : []);
  
    const totalPages = Math.ceil(count / limit);

    if(!results) {
      throw new Error("❌ Route error: No logs found.");
    }
  
    try { res.render('home/history', {
                profile: req.user,
                client: client,
                theme: theme,
                logs: results,
                currentPage: page,
                totalPages,
                selectedType: type
    });
     } catch (error) {
      console.error("❌ Route error:", error.message);
      error.status = 500;
      next(error); // Forward to your global 500 handler
      }
    } catch (error) {
      console.error("❌ Route error:", error.message);
      error.status = 500;
      next(error); // Forward to your global 500 handler
    }
})

router.post('/clear', ensureAuthenticated, async (req, res) => {
  try {
  await db.execute('DELETE FROM logs');
  res.redirect('/history')
  } catch (error) {
    console.error("❌ Route error:", error.message);
    error.status = 500;
    next(error);
  }
})

router.post('/add', ensureAuthenticated, async (req,res) => {
  try {
    const {id, username, userId, content, type, guildname} = req.body
    const timestamp = new Date();
    await db.execute('INSERT INTO logs (userId, username, content, type, guildname) VALUES (?, ?, ?, ?, ?)',
      [userId, username, content, type, guildname]);
    res.redirect('/history');
    } catch (error) {
      console.error("❌ Route error:", error.message);
      error.status = 500;
      next(error);
    }
})

  
module.exports = router;