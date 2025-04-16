const fs = require('node:fs');
const path = require('node:path');
const dotenv = require('dotenv');
const { Client, Collection, Events, GatewayIntentBits, MessageFlags } = require('discord.js');
const cors = require('cors');
const morgan = require('morgan');
const Enmap = require('enmap');
const { logEvent } = require('./modules/logger.js');
const syncHandler = require('./handlers/guildHandler.js');


dotenv.config({ path: './configs/.env' });
const token = process.env['token'];

const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMembers, 
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.MessageContent
    ] 
});

morgan('dev');
cors();
client.commands = new Enmap();
client.commands = new Collection();

const foldersPath = path.join(__dirname, 'commands');

// 🔹 Load standalone command files (excluding index.js)
const commandFiles = fs.readdirSync(foldersPath)
    .filter(file => file.endsWith('.js') && file !== 'index.js'); // ✅ Excludes index.js

for (const file of commandFiles) {
    const filePath = path.join(foldersPath, file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
    } else {
        console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
}

// 🔹 Load commands from subdirectories
const commandFolders = fs.readdirSync(foldersPath, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory()) // ✅ Ensures only directories are processed
    .map(dirent => dirent.name);

for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath)
        .filter(file => file.endsWith('.js')); // ✅ No need to exclude index.js here

    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
        }
    }
}

require('./handlers/commandHandler.js')(client);
require('./handlers/playerHandler.js')(client);
client.once('ready', async() => {
    console.log(`Ready! Logged in as ${client.user.tag}`);
    require('./handlers/statusesHandler.js')(client);
    require('./events/ready.js')(client);
});

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;
    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
    }

    try {
        await command.execute(interaction, client);
    } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
        } else {
            await interaction.reply({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
        }
    }

    const input = `/${interaction.commandName} ${interaction.options._hoistedOptions?.map(o => `${o.name}: ${o.value}`).join(' ') || ''}`;
  
  await logEvent({
    userId: interaction.user.id,
    username: interaction.user.username,
    content: input,
    type: 'command',  
    guildname: interaction.guild.name
  });
});

client.on('messageCreate', async (msg) => {
    if (msg.author.bot) return;

    let content = msg.content?.trim();
    if (!content && msg.attachments.size > 0) {
        content = '[Attachment]';
      } else if (!content) {
        content = '[Empty or non-text message]';
      }
  
    await logEvent({
      userId: msg.author.id,
      username: msg.author.username,
      content,
      type: 'message',
      guildname: msg.guild.name
    });
  });
  
syncHandler(client);

client.login(token);
exports.client = client;
