const fs = require('node:fs');
const path = require('node:path');
const dotenv = require('dotenv');
const { Client, Collection, Events, GatewayIntentBits, MessageFlags,} = require('discord.js');
const cors = require('cors')
const morgan = require('morgan');
const Enmap = require('enmap');

const allowedIPs = ['37.143.253.150']; // Replace with your IP or server IP
const execSync = require('child_process').execSync;

// Function to get external IP (for VPS users)
function getIP() {
    return execSync('curl -s https://api64.ipify.org').toString().trim();
}

const currentIP = getIP();
if (!allowedIPs.includes(currentIP)) {
    console.log(`Unauthorized login detected from ${currentIP}. Shutting down bot.`);
    process.exit(1); // Force bot to stop
}

const token = process.env['DISCORD_TOKEN'];


dotenv.config({ path: 'E:/dbot/src/configs/.env'});
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildVoiceStates] });
morgan('dev'), cors()

client.commands = new Collection();
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);


for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

require('./handlers/statusesHandler.js')(client);
require('./handlers/commandHandler.js')(client);
require('./handlers/playerHandler.js')(client);

client.once(Events.ClientReady, readyClient => {
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

client.on('ready', (c) => {
});

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;
	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
		}
	}
});

client.commands = new Enmap();
	
client.login(token)
exports.client = client;