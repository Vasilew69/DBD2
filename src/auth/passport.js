const dotenv = require('dotenv')
dotenv.config({ path: './configs/.env' });
const passport = require('passport');
var DiscordStrategy = require('passport-discord').Strategy;
module.exports = function(passport) {
    var scopes = ['identify', 'email', 'guilds', 'guilds.join'];
 
    passport.use(new DiscordStrategy({
        clientID: process.env.clientId,
        clientSecret: process.env.clientSecret,
        callbackURL: process.env.callbackURL,
        scope: scopes
    },
    function(accessToken, refreshToken, profile, cb) {
        if(process.env['Admin'].includes(profile.id)){
            return cb(null, profile);
            console.log(profile)
        }else{
            return cb(null, false, { message: 'Unauthorised! Please add your client ID to the config!' })
        }
    }));

    passport.serializeUser(function(user, done) {
        done(null, user);
      });
      
      passport.deserializeUser(function(user, done) {
        done(null, user);
      });
}