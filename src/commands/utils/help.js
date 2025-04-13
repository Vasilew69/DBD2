const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
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

        // Create an embed using EmbedBuilder
        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('Available Commands')
            .setDescription('Here is the list of commands available for you to use:')
            .setFooter({ text: 'Use /command_name to execute commands' });

        // Add categories and commands to the embed (fields must be added before the embed is sent)
        for (const [category, commands] of Object.entries(commandCategories)) {
            embed.addFields(
                { 
                    name: `${category.charAt(0).toUpperCase() + category.slice(1)} Commands`, 
                    value: commands, 
                    inline: false 
                }
            );
        }

        // Send the embed as a reply
        await interaction.reply({ embeds: [embed],   });
    },
};

module.exports.details = {
    name: 'help',
    author: 'Vasilew__',
    icon: 'https://cdn.discordapp.com/avatars/365350852967399454/ce6e6e91fa887aa86e23ef356c9878fe',
    description: 'Displays a list of available commands with categories.',
    usage: '/help'
}