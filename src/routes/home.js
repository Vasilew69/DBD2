var dateFormat = require('dateformat');
const dotenv = require('dotenv');
const express = require('express');
const router = express.Router();
const semver = require('semver');  // <-- added
const chalk = require('chalk');    // optional, for logging color
const {getClient, shutdownClient, restartClient, createClient} = require('../bot')
const { ensureAuthenticated, forwardAuthenticated } = require('../auth/auth');
const ver = require('../configs/version.json')
const number = require('easy-number-formatter')
var request = require("request");
const jsonfile = require('jsonfile')
var now = new Date()
dotenv.config({ path: './configs/.env'})
const themes = "./configs/theme.json"

router.get('/', ensureAuthenticated,(req,res) =>{
    res.redirect('/home')
})

router.get('/home', ensureAuthenticated, async (req, res) => {
  let client = await getClient() || {};
  let username = client.user?.username || "Bot Offline";
  const profile = req.user;

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

  request(options, function (error, response, body) {
  let verL = ver.ver;
  let updateAvailable = false;
  let updateType = null;   // 'major' | 'minor' | 'patch'
  const isBetaTester = semver.prerelease(ver.ver) !== null;

  try {
    const jsonparsed = JSON.parse(body)
    verL = jsonparsed.ver;

    if (semver.valid(verL) && semver.valid(ver.ver) && semver.gt(verL, ver.ver)) {
      updateAvailable = true;
      updateType = semver.diff(ver.ver, verL); 
    }

    // Check if current version is a pre-release (beta/rc etc)
    if (semver.prerelease(ver.ver)) {
      isBetaTester = true;
    }
  } catch (e) {
    console.log(chalk.red("Failed to check for updates. You may continue using this version, please try again or contact Vasilew__"))
  }

  res.render('home/home', {
    profile: profile,
    client: client,
    joinedDate: dateFormat(now, "dddd, mmmm dS, yyyy, h:MM:ss TT"),
    prefix: "/",
    number: number,
    Latestversion: verL,
    Currentversion: ver.ver,
    theme: theme,
    updateAvailable: updateAvailable,
    updateType: updateType,
    isBetaTester: isBetaTester  // NEW FLAG sent to template
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