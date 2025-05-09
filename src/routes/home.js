var dateFormat = require('dateformat');
const dotenv = require('dotenv');
const express = require('express');
const router = express.Router();
const {getClient, shutdownClient, restartClient, createClient} = require('../bot')
const { ensureAuthenticated, forwardAuthenticated } = require('../auth/auth');
const ver = require('../configs/version.json')
const number = require('easy-number-formatter')
var request = require("request");
const jsonfile = require('jsonfile')
var now = new Date()
dotenv.config({ path: './configs/.env'})
const limiter = require('../index')
const themes = "./configs/theme.json"

router.get('/', ensureAuthenticated,(req,res) =>{
    res.redirect('/home')
})

router.get('/home', ensureAuthenticated,(req, res) => {
  let client = getClient() || {};
  let username = client.user?.username || "Bot Offline";

  const profile = req.user; // Assuming the user profile is stored in req.user after successful authentication

  if (!profile) {
    return res.render('error', { message: 'Profile is not available.' });
  }
  var theme = jsonfile.readFileSync(themes);
    var options = {
        method: 'GET',
        url: `https://raw.githubusercontent.com/Vasilew69/DBD2/main/src/configs/version.json`,
        headers: {
          'User-Agent': 'Discord-Bot-Dashboard',
          useQueryString: true
        }
      }
      // Prase update request data to JSON.
      request(options, function (error, response, body) {
        try 
        {
          jsonprased = JSON.parse(body)
          verL = jsonprased.ver
        } 
        catch (e) 
        {
          console.log(chalk.red("Failed to check for updates you may continue using this version, please try again or contact Vasilew__"))
          verL = ver.ver
        }
    res.render('home/home',{
        profile:profile,
        client:client,
        joinedDate:dateFormat(now, "dddd, mmmm dS, yyyy, h:MM:ss TT"),
        prefix:"/",
        number:number,
        Latestversion:verL,
        Currentversion:ver.ver,
        theme:theme
    })
    })
})

// Logout
router.get('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.flash('success', 'Logged out');
    res.redirect('/login');
  });
});

router.post('/api/power/shutdown', ensureAuthenticated, async (req, res, next) => {
  try {
    shutdownClient();
    req.flash('success', 'Bot has been shutdown');
    res.redirect('/home');
  } catch (error) {
    console.error("❌ Route error:", error.message);
    error.status = 500;
    next(error);
  }
});

router.post("/api/power/restart", ensureAuthenticated, async (req, res, next) => {
  try{
    restartClient();
    setTimeout(() => {
    req.flash('success', 'Bot has been shutdown');
    res.redirect('/home'), 10000
    })
  } catch (error) {
    console.error("❌ Route error:", error.message);
    error.status = 500;
    next(error);
  }
});

router.post("/api/power/start", ensureAuthenticated, async (req, res, next) => {
  try{
    createClient();
    req.flash('success', 'Bot has been restarted');
    res.redirect('/home');
  } catch (error) {
    console.error("❌ Route error:", error.message);
    error.status = 500;
    next(error);
  }
});
  
module.exports = router;