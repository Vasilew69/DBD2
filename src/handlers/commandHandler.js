const { REST, Routes } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const dotenv = require('dotenv');

dotenv.config();

const clientId = process.env['CLIENTID'];
const token = process.env['DISCORD_TOKEN'];
const commands = [];

module.exports = (client) => {
    const foldersPath = path.join(__dirname, '../commands');

    // 🔹 Load standalone command files (excluding index.js)
    const commandFiles = fs.readdirSync(foldersPath, { withFileTypes: true })
        .filter(dirent => dirent.isFile() && dirent.name.endsWith('.js') && dirent.name !== 'index.js') // ✅ Exclude index.js
        .map(dirent => dirent.name);

    for (const file of commandFiles) {
        const filePath = path.join(foldersPath, file);
        try {
            const command = require(filePath);
            if ('data' in command && 'execute' in command) {
                if (!command.data.description || typeof command.data.description !== 'string') {
                    console.error(`[ERROR] Command at ${filePath} is missing a valid description.`);
                } else {
                    commands.push(command.data.toJSON());
                }
            } else {
                console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
            }
        } catch (error) {
            console.error(`[ERROR] Failed to load command ${filePath}:`, error);
        }
    }

    // 🔹 Load commands from subdirectories
    const commandFolders = fs.readdirSync(foldersPath, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory()) // ✅ Ensures only directories are processed
        .map(dirent => dirent.name);

    for (const folder of commandFolders) {
        const folderPath = path.join(foldersPath, folder);
        const commandFiles = fs.readdirSync(folderPath)
            .filter(file => file.endsWith('.js'));

        for (const file of commandFiles) {
            const filePath = path.join(folderPath, file);
            try {
                const command = require(filePath);
                if ('data' in command && 'execute' in command) {
                    if (!command.data.description || typeof command.data.description !== 'string') {
                        console.error(`[ERROR] Command at ${filePath} is missing a valid description.`);
                    } else {
                        commands.push(command.data.toJSON());
                        commands.push(command.data.f);
                    }
                } else {
                    console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
                }
            } catch (error) {
                console.error(`[ERROR] Failed to load command ${filePath}:`, error);
            }
        }
    }

    // 🔹 Deploy the commands
    const rest = new REST().setToken(token);

    (async () => {
        try {
            console.log(`Started refreshing ${commands.length} application (/) commands.`);

            const data = await rest.put(
                Routes.applicationCommands(clientId),
                { body: commands },
            );

            console.log(`Successfully reloaded ${data.length} application (/) commands.`);
        } catch (error) {
            console.error(`[ERROR] Failed to deploy commands:`, error);
        }
    })();
};
