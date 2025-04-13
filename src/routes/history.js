const express = require('express');
const db = require('../database/db')
const router = express.Router();
const themes = "../src/configs/theme.json";
const jsonfile = require('jsonfile');
const { client } = require('../bot');
const { ensureAuthenticated } = require('../auth/auth');

router.get('/history', ensureAuthenticated, async (req, res) => {
    const theme = jsonfile.readFileSync(themes);
    const [rows] = await db.execute('SELECT * FROM logs ORDER BY timestamp DESC LIMIT 1000') || 'nothing';
    try { res.render('home/history', {
                profile: req.user,
                client: client,
                theme: theme,
                logs: rows,
    });
     } catch (error) {
        console.error("❌ Something Happened:", error);
        return res.status(500).json({ error: `${error}` });
    }
})

router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success', 'Logged out');
    res.redirect('/login');
  });
  
module.exports = router;