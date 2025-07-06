const path = require('node:path');
const fs = require('fs');
const https = require('https');
const express = require('express');
const { createClient, getClient } = require('./bot');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const fileUpload = require('express-fileupload');
const dotenv = require('dotenv');
const morgan = require('morgan');
const cors = require('cors');
const favicon = require('serve-favicon');
dotenv.config({ path: './configs/.env' });
var partials = require('express-partials')

const app = express();

app.use((req, res, next) => {
  if (!req.secure) {
    return res.redirect(`https://${req.headers.host}${req.url}`);
  }
  next();
});

// 🔒 Load SSL certificates
const sslOptions = {
  key: fs.readFileSync('./ssl/key.pem'),
  cert: fs.readFileSync('./ssl/cert.pem')
};

// 🔒 Create HTTPS server
const httpsServer = https.createServer(sslOptions, app);
const io = require('socket.io')(httpsServer);

const createDbAndTables = require('./database/checkdb.js');

// Trust proxy for secure cookies
app.set('trust proxy', 1);

app.use(function (req, res, next) {
  if (req.session && req.session.passport && req.session.passport.user) {
    User.findById(req.session.passport.user, function (err, user) {
      if (err) return next(err);
      req.user = user;
      next();
    });
  } else {
    next();
  }
});

app.set('views', path.join(__dirname, 'views'));

const RateLimit = require('express-rate-limit');
const checkForUpdates = require('./modules/updateChecker.js');
const limiter = RateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

const port = process.env.port || 443;

app.use(limiter);
app.use(express.static('./public'));
app.use(express.static('./themes'));
app.use(partials());
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true, limit: '5mb' }));
app.use(fileUpload());
app.use(express.json());
app.use(favicon(path.join(__dirname, 'public', 'images', 'favicon.png')));

require('./auth/passport')(passport);
app.use(morgan('dev'), cors());

createClient().then((loggedInClient) => {
  io.sockets.on('connection', function (sockets) {
    setInterval(function () {
      let days = Math.floor(loggedInClient.uptime / 86400000);
      let hours = Math.floor(loggedInClient.uptime / 3600000) % 24;
      let minutes = Math.floor(loggedInClient.uptime / 60000) % 60;
      let seconds = Math.floor(loggedInClient.uptime / 1000) % 60;
      var BOTuptime = `${days}d ${hours}h ${minutes}m ${seconds}s`;
      sockets.emit('uptime', { uptime: BOTuptime });
    }, 1000);
  });
});

app.use(session({
  secret: process.env.secret,
  resave: false,
  saveUninitialized: true,
  secure: true,
  httpOnly: true
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.use(function (req, res, next) {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});

// Routes
app.use('/', require('./routes/home.js'));
app.use('/', require('./routes/settings.js'));
app.use('/', require('./routes/guilds.js'));
app.use('/', require('./routes/support.js'));
app.use('/', require('./routes/commands.js'));
app.use('/', require('./routes/player.js'));
app.use('/', require('./routes/history.js'));
app.use("/", require("./routes/members.js"));
app.use("/", require("./routes/welcome.js"));
app.use("/", require("./routes/plugins.js"));
app.use("/", require("./routes/reactionRoles.js"));
app.use("/", require("./routes/automod.js"));
app.use("/", require("./routes/activity.js"));
app.use("/", require("./routes/sendMessage.js"));
app.use("/", require("./routes/levels.js"));
app.use("/", require("./routes/levelSettings.js"))
app.use('/login', require('./routes/login.js'));

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).render('error_pages/500', {
    message: err.message,
    error: err,
    status: err.status || 500
  });
});

app.use(function (req, res) {
  res.status(404).render('error_pages/404', {
    url: req.originalUrl,
    method: req.method
  });
});

// Start HTTPS server
httpsServer.listen(port, () => {
  console.log(`✅ HTTPS server running at https://localhost:${port}`);
});

// Database setup
createDbAndTables()
  .then(() => {
    console.log("📦 Database and tables are set up.");
  })
  .catch((err) => {
    console.error("❌ Error setting up database:", err);
  });

global.updateStatus = {
  Latestversion: null,
  Currentversion: null,
  updateAvailable: false,
  updateType: null,
  isBetaTester: false
};

async function runUpdateCheck() {
  try {
    const result = await checkForUpdates();
    global.updateStatus = result;
  } catch (err) {
    console.error("❌ Update check failed:", err);
  }
}

// Run on startup and every 10 mins
runUpdateCheck();
setInterval(runUpdateCheck, 24 * 60 * 60 * 1000);

exports = limiter;
