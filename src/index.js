const path = require('node:path');
const express = require('express')
const client = require('./bot')
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const fileUpload = require('express-fileupload');
const dotenv = require('dotenv');
const morgan = require('morgan');
const cors = require('cors');
dotenv.config()

const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

app.set('views', path.join(__dirname, 'views'));

port = process.env.port;

app.use(express.static('./public'));
app.use(express.static('./themes'));
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true,limit: '5mb' }));
app.use(fileUpload());

require('./auth/passport')(passport);

app.use(morgan('dev'), cors())



// Express session
app.use(
    session({
      secret: '4135231b7f33c66406cdb2a78420fa76',
      resave: true,
      saveUninitialized: true
    })
);
  
// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash
app.use(flash());

// Global variables
app.use(function(req, res, next) {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});

app.use('/', require('./routes/home.js'));
app.use('/', require('./routes/settings.js'));
app.use('/', require('./routes/guilds.js'));
app.use('/', require('./routes/support.js'));
app.use('/', require('./routes/plugins.js'));
app.use('/', require('./routes/player.js'));

app.use('/login', require('./routes/login.js'));

http.listen(port)

io.sockets.on('connection', function(sockets){
  setInterval(function(){ 
    // Uptime Count
    let days = Math.floor(client.client.uptime / 86400000);
    let hours = Math.floor(client.client.uptime / 3600000) % 24;
    let minutes = Math.floor(client.client.uptime / 60000) % 60;
    let seconds = Math.floor(client.client.uptime / 1000) % 60;
  
    var BOTuptime = `${days}d ${hours}h ${minutes}m ${seconds}s` 
    
    // Emit count to browser 
    sockets.emit('uptime',{uptime:BOTuptime}); }, 1000);
})

// Error Pages
app.use(function(req,res){
  res.status(404).render('error_pages/404');
});