const express = require('express');
const router = express.Router();
const discord = require('../bot')
const { ensureAuthenticated, forwardAuthenticated } = require('../auth/auth');
const version = require('../configs/version.json')
const path = require('path')
const ENV_PATH = path.join(__dirname, '..', '/configs/.env');
const jsonfile = require('jsonfile')
const themes = "./configs/theme.json"
const dotenv = require('dotenv')
dotenv.config({ path: './configs/.env' })

const fs = require("fs");

router.get('/settings', ensureAuthenticated,(req, res) => {
    var config = process.loadEnvFile
    var theme = jsonfile.readFileSync(themes);
    fs.readdir("./themes/", (err, files) => {
    res.render('home/settings',{
        profile:req.user,
        client:discord.client,
        config:config,
        version:version,
        themeName:files,
        theme:theme
    })
    })
})

router.post('/settings/config', ensureAuthenticated, (req, res) => {
  const keys = ['clientID', 'clientSecret', 'callbackURL', 'admin', 'token', 'prefix', 'port'];
  const updates = req.body; // { KEY: 'value', ... }

    // Load current .env as key-value pairs
    const currentEnv = fs.existsSync(ENV_PATH)
        ? fs.readFileSync(ENV_PATH, 'utf-8')
              .split('\n')
              .filter(Boolean)
              .reduce((acc, line) => {
                  const [key, ...valParts] = line.split('=');
                  acc[key] = valParts.join('=');
                  return acc;
              }, {})
        : {};

    // Apply updates
    Object.entries(updates).forEach(([key, value]) => {
        currentEnv[key] = value;
    });

    // Convert back to .env format
    const newEnvContent = Object.entries(currentEnv)
        .map(([key, value]) => `${key}=${value}`)
        .join('\n');

    // Save to .env file
    fs.writeFileSync(ENV_PATH, newEnvContent);

  req.flash('success', 'Config updated successfully. Please restart the app!');
  res.redirect('/settings');
});

router.post('/settings/dashboard',ensureAuthenticated,(req,res) =>{
    json.update('./configs/theme.json',{theme:`${req.body.theme}`}).then(function(dat) { 
        req.flash('success', 'Theme Updated!')
        res.redirect('/settings')
    })
})

router.post('/settings/upload/theme', ensureAuthenticated,function(req, res) {
    let sampleFile;
    let uploadPath;
  
    if (!req.files || Object.keys(req.files).length === 0) {
      return req.flash('error', `No file was uploaded, please try again!`), 
      res.redirect('/settings')
    }
    if(!req.files.sampleFile.name.endsWith(".css")){
      return req.flash('error', `Please only upload CSS files!`), 
      res.redirect('/settings')
    }
    const path = './themes/' + req.files.sampleFile.name
    if(fs.existsSync(path)) {
      return req.flash('error', `Theme with that name already exists!`), 
      res.redirect('/settings')
    }

    sampleFile = req.files.sampleFile;
    uploadPath = './themes/' + sampleFile.name;
  
    sampleFile.mv(uploadPath, function(err) {
      if (err)
        return res.status(500).send(err);
  
        req.flash('success', `Theme ${sampleFile.name} successfully uploaded!`)
        res.redirect('/settings')
    });
});
  
module.exports = router;