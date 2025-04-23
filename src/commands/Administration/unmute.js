const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
    .setName('unmute')
    .setDescription('unmute a user')
    .setDefaultMemberPermissions(PermissionFlagsBits.MANAGE_ROLES)
    .addUserOption(option => option
        .setName('user')
        .setDescription('The user to unmute')
        .setRequired(true)
    ),

    async execute(interaction) {
        // Get the user to unmute from the interaction options
        const user = interaction.options.getUser('user');

        // Get the muted role from the guild
        const mutedRole = interaction.guild.roles.cache.find(role => role.name === 'Muted');
        if (!mutedRole) {
            return interaction.reply("The muted role doesn't exist.");
        }
        // Check if the user is already muted
        if (!user.roles.cache.has(mutedRole.id)) {
            const nomutEmbed = new EmbedBuilder()
            .setTitle("Unmute")
            .setDescription(`User ${user.username} is not muted.`)
            .setColor(0x0099FF);
            return interaction.reply({ embeds: [nomutEmbed]});
        }
        // Remove the muted role from the user
        user.roles.remove(mutedRole.id);
        const unEmbed = new EmbedBuilder()
        .setTitle("Unmute")
        .setDescription(`User ${user.username} has been unmuted.`)
        .setColor(0x0099FF);
    }
}
module.exports.details = {
    name: 'Unmute',
    description: 'unmute a user',
    author: 'Vasilew__',
    icon: 'https://cdn.discordapp.com/avatars/1161409662269272135/1ac51b5bbca693172e69336bb35d77b0',
    usage: '/unmute @user'
}