const fs = require('node:fs');
const path = require('node:path');
const dotenv = require('dotenv');
const { Client, Collection, Events, GatewayIntentBits, MessageFlags, Partials } = require('discord.js');
const cors = require('cors');
const morgan = require('morgan');
const Enmap = require('enmap');
const { logEvent } = require('./modules/logger.js');
const syncHandler = require('./handlers/guildHandler.js');
const { Player } = require('discord-player');
const { DefaultExtractors } = require('@discord-player/extractor');
const { YoutubeiExtractor } = require('discord-player-youtubei');
const setStatus = require('./handlers/statusHandler.js')

dotenv.config({ path: './configs/.env' });
const token = process.env['token'];

let client = null; // we'll use this for dynamic control

function createClient() {
  client = new Client({ 
    intents: [
      GatewayIntentBits.Guilds, 
      GatewayIntentBits.GuildMembers, 
      GatewayIntentBits.GuildMessages, 
      GatewayIntentBits.GuildVoiceStates,
      GatewayIntentBits.GuildMessageReactions,
      GatewayIntentBits.MessageContent
    ],
    partials: [
      Partials.Message,
      Partials.Channel,
      Partials.Reaction,
      Partials.User,
    ]
  });

  morgan('dev');
  cors();

  client.commands = new Enmap();
  client.commands = new Collection();

  const foldersPath = path.join(__dirname, 'commands');

  const commandFiles = fs.readdirSync(foldersPath)
    .filter(file => file.endsWith('.js') && file !== 'index.js');

  for (const file of commandFiles) {
    const filePath = path.join(foldersPath, file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
      client.commands.set(command.data.name, command);
    } else {
      console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
  }

  const commandFolders = fs.readdirSync(foldersPath, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath)
      .filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
      const filePath = path.join(commandsPath, file);
      const command = require(filePath);
      if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
      }
    }
  }

  // Load handlers
  require('./handlers/commandHandler.js')(client);
  require('./handlers/playerHandler.js')(client);
  require('./handlers/reactionHandler')(client);
  require('./handlers/AuditLogger')(client);
  require('./handlers/autoModHandler.js')(client);

  client.once('ready', async () => {
    console.log(`Ready! Logged in as ${client.user.tag}`);
    require('./events/ready.js')(client);
    require('./events/guildMember.js')(client);
    setStatus(client);
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
      guildname: interaction.guild.name,
      guildid: interaction.guild.id,
      channelId: interaction.channel.id
    });
  });

  syncHandler(client);

  client.player = new Player(client, {
    ytdlOptions: {
        quality: 'highestaudio',
        highWaterMark: 1 << 25
    }
});
client.player.extractors.loadMulti(DefaultExtractors)
client.player.extractors.register(YoutubeiExtractor, {})

  return client.login(token).then(() => {
    console.log("✅ Discord client logged in!");
    return client;
})
.catch((err) => {
  console.error("Error logging in: ", err);
});
}

// For control from Express
function shutdownClient() {
  if (client) {
    client.destroy();
    console.log("Bot shut down.");
    client = null;
  }
}

async function restartClient() {
  shutdownClient();
  await createClient();
}

async function getClient() {
  return client;
}

module.exports = {
  createClient,
  shutdownClient,
  restartClient,
  getClient
};
