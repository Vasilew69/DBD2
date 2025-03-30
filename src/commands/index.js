const fs = require('fs');
const path = require('path');

const commands = {};

// 🔹 Get all `.js` files inside `commands/`, excluding `index.js`
const commandFiles = fs.readdirSync(__dirname)
    .filter(file => file.endsWith('.js') && file !== 'index.js');

for (const file of commandFiles) {
    const commandName = file.replace('.js', '');
    try {
        commands[commandName] = require(path.join(__dirname, file));
    } catch (error) {
        console.error(`[ERROR] Failed to load command: ${file}`, error);
    }
}

// 🔹 Get all subdirectories (e.g., "Administration", "Moderation")
const subDirs = fs.readdirSync(__dirname, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

for (const folder of subDirs) {
    const folderPath = path.join(__dirname, folder);
    const subCommandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));

    for (const file of subCommandFiles) {
        const commandName = file.replace('.js', '');
        try {
            commands[commandName] = require(path.join(folderPath, file));
            console.log("Loaded command categories:", subDirs);
console.log("Loaded commands:", Object.keys(commands));
        } catch (error) {
            console.error(`[ERROR] Failed to load command: ${folder}/${file}`, error);
        }
    }
}

module.exports = commands;
