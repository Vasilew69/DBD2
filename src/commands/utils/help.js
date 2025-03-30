const { SlashCommandBuilder, EmbedBuilder } = require('@discordjs/builders');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Shows a list of available commands with categories'),

    async execute(interaction) {
        const commandCategories = {};
        const commandsPath = path.join(__dirname, '..');
        
        // Loop through the command directories and files
        const categoryDirs = fs.readdirSync(commandsPath).filter((file) => fs.statSync(path.join(commandsPath, file)).isDirectory());

        for (const category of categoryDirs) {
            const commandFiles = fs.readdirSync(path.join(commandsPath, category)).filter((file) => file.endsWith('.js'));
            const commandNames = [];

            for (const file of commandFiles) {
                const command = require(path.join(commandsPath, category, file));
                commandNames.push('/' + command.data.name);  // Add / before the command name
            }

            // Store commands by category
            commandCategories[category] = commandNames.join(', ');
        }

        // Create a response string with commands categorized
        let response = '\n\n';
        for (const [category, commands] of Object.entries(commandCategories)) {
            response += `**${category.charAt(0).toUpperCase() + category.slice(1)} Commands:**\n`;
            response += `${commands}\n\n`;
        }

        const message = new EmbedBuilder()
                .setColor(0x0099FF)
                .setTitle(`**Available Commands:**`)
                .addFields(
                    { name: '', value: response, inline: false }
                )

        await interaction.reply({ embeds:[message], ephemeral: false });
    },
};
