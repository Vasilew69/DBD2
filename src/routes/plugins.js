const express = require('express');
const router = express.Router();
const discord = require('../bot')
const { ensureAuthenticated, forwardAuthenticated } = require('../auth/auth');
const fs = require("fs");
const jsonfile = require('jsonfile');
const themes = "./configs/theme.json"
const prth = "./configs/prth.json";
const commandsJsonFile = "./configs/commands.json";
const path = require('path');

router.get('/plugins', ensureAuthenticated, (req, res) => {
    const commands = jsonfile.readFileSync(commandsJsonFile);  // Read commands from JSON file  // Log the commands to check the format

    var theme = jsonfile.readFileSync(themes);  // Read theme settings
    const commandsToggle = jsonfile.readFileSync('./configs/settings.json');  // Read settings for toggles

    // Now render the page
    res.render('home/plugins', {
        profile: req.user,
        client: discord.client,
        commands: commands,  // Pass the whole commands object
        commandsToggle: commandsToggle,  // Pass the settings for commands toggling
        theme: theme,  // Pass the theme to the template
        prth: prth  // Path to prth config
    });
});

router.post('/plugins/remove/:plugin', ensureAuthenticated, function (req, res) {
    try {
        const commandName = req.params.plugin;
        const commands = jsonfile.readFileSync(commandsJsonFile);

        // Find the command object
        const commandToDelete = commands.find(cmd => cmd.name === commandName);
        if (!commandToDelete || !commandToDelete.location) {
            req.flash('error', `Plugin ${commandName} not found!`);
            return res.redirect('/plugins');
        }

        const filePath = commandToDelete.location;
        console.log("Deleting:", filePath);

        if (!filePath || typeof filePath !== "string") {
            req.flash('error', `Invalid file path for ${commandName}`);
            return res.redirect('/plugins');
        }

        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            req.flash('success', `Plugin ${commandName} removed!`);
        } else {
            req.flash('error', `Plugin file not found: ${filePath}`);
        }

        res.redirect('/plugins');
    } catch (err) {
        console.error("Error while removing plugin:", err);
        req.flash('error', 'An error occurred while removing the plugin');
        res.redirect('/plugins');
    }
});

router.post('/plugins/toggle', ensureAuthenticated, function (req, res) {
    // Remove plugin from settings file
    if (req.body.toggle == "true") {
        fs.readFile('./configs/settings.json', function (err, data) {
            var json = JSON.parse(data);
            if (!json.includes(req.body.commandName)) {
                return req.flash('error', `Error`), 
                res.redirect('/plugins');
            }
            json.splice(json.indexOf(`${req.body.commandName}`), 1);
            fs.writeFile("./configs/settings.json", JSON.stringify(json), function (err) {
                if (err) throw err;
                res.redirect('/plugins');
            });
        });
    }

    // Add plugin to settings file
    if (req.body.toggle == "false") {
        fs.readFile('./configs/settings.json', function (err, data) {
            var json = JSON.parse(data);
            if (json.includes(req.body.commandName)) {
                return req.flash('error', `Error`), 
                res.redirect('/plugins');
            }
            json.push(`${req.body.commandName}`);
            fs.writeFile("./configs/settings.json", JSON.stringify(json), function (err) {
                if (err) throw err;
                res.redirect('/plugins');
            });
        });
    }
});

router.post('/plugins/upload', ensureAuthenticated, function (req, res) {
    if (!req.files || Object.keys(req.files).length === 0) {
        req.flash('error', 'No file uploaded!');
        return res.redirect('/plugins');
    }

    const sampleFile = req.files.sampleFile;
    
    // Debug: Log the category value
    console.log('Category from request:', req.body.category);

    // Check the category value
    const category = req.body.category?.trim() || 'misc';
    console.log('Final category chosen:', category);  // Log final category

    // Ensure the category folder exists
    const categoryPath = path.join('./commands', category);
    if (!fs.existsSync(categoryPath)) {
        fs.mkdirSync(categoryPath, { recursive: true });
    }

    // Check if the file already exists in the chosen category
    const uploadPath = path.join(categoryPath, sampleFile.name);
    if (fs.existsSync(uploadPath)) {
        req.flash('error', 'A plugin with that name already exists!');
        return res.redirect('/plugins');
    }

    sampleFile.mv(uploadPath, function (err) {
        if (err) {
            console.error('Error moving file:', err);
            return res.status(500).send(err);
        }

        req.flash('success', `Plugin ${sampleFile.name} uploaded in ${category} category!`);
        res.redirect('/plugins');

        console.log('Category path:', categoryPath);  // This will show the actual path where the file is being uploaded.

    });
});

module.exports = router;
