const fs = require('fs');
const path = require('path');
const commands = {};

// Load command files in the current directory, excluding index.js
const commandFiles = fs.readdirSync(__dirname).filter(file => file.endsWith('.js') && file !== 'index.js');

for (const file of commandFiles) {
    const commandName = file.slice(0, -3); // Remove '.js' extension
    commands[commandName] = require(path.join(__dirname, file));
}

// Load command files from subdirectories
const subDirs = fs.readdirSync(__dirname, { withFileTypes: true }).filter(dirent => dirent.isDirectory()).map(dirent => dirent.name);

for (const folder of subDirs) {
    const folderPath = path.join(__dirname, folder);
    const subCommandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));

    for (const file of subCommandFiles) {
        const commandName = file.replace('.js', ''); // Remove '.js' extension
        commands[commandName] = require(path.join(folderPath, file));
    }
}

module.exports = commands;
