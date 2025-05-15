const express = require('express');
const router = express.Router();
const discord = require('../bot')
const { ensureAuthenticated, forwardAuthenticated } = require('../auth/auth');
const fs = require("fs");
const sanitize = require('sanitize-filename');
const jsonfile = require('jsonfile');
const themes = "./configs/theme.json"
const prth = "./configs/prth.json";
const commandsJsonFile = "./configs/commands.json";
const path = require('path');
const { console } = require('inspector');

router.get('/commands', ensureAuthenticated, async (req, res, next) => {
    try{
        const client = discord.getClient();
    const commands = jsonfile.readFileSync(commandsJsonFile);  // Read commands from JSON file  // Log the commands to check the format
    console.log(commands)

    var theme = jsonfile.readFileSync(themes);  // Read theme settings
    const commandsToggle = jsonfile.readFileSync('./configs/settings.json');  // Read settings for toggles

    // Now render the page
    res.render('home/commands', {
        profile: req.user,
        client: client,
        commands: commands,  // Pass the whole commands object
        commandsToggle: commandsToggle,  // Pass the settings for commands toggling
        theme: theme,  // Pass the theme to the template
        prth: prth  // Path to prth config
    });
        } catch (error) {
        console.error("❌ Route error:", error.message);
        error.status = 500;
        next(error);
        }
});

router.post('/commands/remove/:plugin', ensureAuthenticated, function (req, res, ) {
    try {
        const commandName = req.params.plugin;
        const commands = jsonfile.readFileSync(commandsJsonFile);

        // Find the command object
        const commandToDelete = commands.find(cmd => cmd.name === commandName);
        if (!commandToDelete || !commandToDelete.location) {
            req.flash('error', `Plugin ${commandName} not found!`);
            return res.redirect('/commands');
        }

        const filePath = commandToDelete.location;
        console.log("Deleting:", filePath);

        if (!filePath || typeof filePath !== "string") {
            req.flash('error', `Invalid file path for ${commandName}`);
            return res.redirect('/commands');
        }

        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            req.flash('success', `Plugin ${commandName} removed!`);
        } else {
            req.flash('error', `Plugin file not found: ${filePath}`);
        }

        res.redirect('/commands');
    } catch (err) {
        console.error("Error while removing plugin:", err);
        req.flash('error', 'An error occurred while removing the plugin');
        res.redirect('/commands');
    }
});

router.post('/commands/toggle', ensureAuthenticated, function (req, res) {
    // Remove plugin from settings file
    if (req.body.toggle == "true") {
        fs.readFile('./configs/settings.json', function (err, data) {
            var json = JSON.parse(data);
            if (!json.includes(req.body.commandName)) {
                return req.flash('error', `Error`), 
                res.redirect('/commands');
            }
            json.splice(json.indexOf(`${req.body.commandName}`), 1);
            try {
            fs.writeFile("./configs/settings.json", JSON.stringify(json), function (err) {
                res.redirect('/commands');
            });
        } catch (err) {
            console.log(err);
            res.status(500);
            res.end();
        }
        });
    }

    // Add plugin to settings file
    if (req.body.toggle == "false") {
        fs.readFile('./configs/settings.json', function (err, data) {
            var json = JSON.parse(data);
            if (json.includes(req.body.commandName)) {
                return req.flash('error', `Error`), 
                res.redirect('/commands');
            }
            json.push(`${req.body.commandName}`);
            try {
            fs.writeFile("./configs/settings.json", JSON.stringify(json), function (err) {
                res.redirect('/commands');
            });
        } catch (err) {
            console.log(err);
            res.status(500);
            res.end();
        }
        });
    }
});

router.post('/commands/upload', ensureAuthenticated, function (req, res) {
    if (!req.files || Object.keys(req.files).length === 0) {
        req.flash('error', 'No file uploaded!');
        return res.redirect('/commands');
    }

    const sampleFile = req.files.sampleFile;
    
    // Debug: Log the category value
    console.log('Category from request:', req.body.category);

    // Check the category value
    const sanitize = require('sanitize-filename');
    const category = sanitize(req.body.category?.trim() || 'misc');
    console.log('Final sanitized category chosen:', category);  // Log final category

    // Ensure the category folder exists
    const baseDir = path.join(__dirname, 'commands');
    const categoryPath = path.join(baseDir, category);
    const resolvedPath = path.resolve(categoryPath);
    if (!resolvedPath.startsWith(baseDir)) {
        req.flash('error', 'Invalid category name!');
        return res.redirect('/commands');
    }
    if (!fs.existsSync(resolvedPath)) {
        fs.mkdirSync(resolvedPath, { recursive: true });
    }

    // Check if the file already exists in the chosen category
    const sanitizedFileName = sanitize(sampleFile.name);
    if (!sanitizedFileName) {
        req.flash('error', 'Invalid file name!');
        return res.redirect('/commands');
    }
    const sanitizedFileNameA = sanitize(sampleFile.name);
    console.log('Sanitized file name:', sanitizedFileNameA);  // Debug: Log the sanitized file name
    const uploadPath = path.join(categoryPath, sanitizedFileNameA);
    if (fs.existsSync(uploadPath)) {
        req.flash('error', 'A plugin with that name already exists!');
        return res.redirect('/commands');
    }

    sampleFile.mv(uploadPath, function (err) {
        if (err) {
            console.error('Error moving file:', err);
            return res.status(500).send(err);
        }

        req.flash('success', `Plugin ${sampleFile.name} uploaded in ${category} category!`);
        res.redirect('/commands');

        console.log('Category path:', categoryPath);  // This will show the actual path where the file is being uploaded.

    });
});

module.exports = router;
