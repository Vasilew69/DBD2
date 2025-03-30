const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
    .setName('timeout')
    .setDescription('set a timeout for a user')
    .setDefaultMemberPermissions(PermissionFlagsBits.MODERATE_MEMBERS, PermissionFlagsBits.ManageRoles)
        .addUserOption(option => option
        .setName('user')
        .setDescription('the user to timeout')
        .setRequired(true)
    )
    .addIntegerOption(option => option
       .setName('duration')
       .setDescription('the duration of the timeout in seconds')
       .setRequired(true)
    ),
    async execute(interaction) {
        if (!interaction.guild) {
            return interaction.reply({ content: 'This command can only be used in a server.', ephemeral: true });
        }
    
        const member = interaction.options.getMember('user');
        const duration = interaction.options.getInteger('duration');
    
        if (!member) {
            return interaction.reply({ content: 'User is not in the server.', ephemeral: true });
        }
    
        let timeoutRole = interaction.guild.roles.cache.find(role => role.name === 'Timeouted');
    
        if (!timeoutRole) {
            try {
                timeoutRole = await interaction.guild.roles.create({
                    name: 'Timeouted',
                    permissions: []
                });
            } catch (error) {
                console.error(error);
                return interaction.reply({ content: 'An error occurred while creating the timeout role.', ephemeral: true });
            }
        }
    
        if (member.roles.cache.has(timeoutRole.id)) {
            return interaction.reply({ content: 'The user is already timed out.', ephemeral: true });
        }
    
        if (interaction.guild.ownerId === member.id) {
            return interaction.reply({ content: 'You cannot timeout the server owner.', ephemeral: true });
        }
    
        if (member.user.bot) {
            return interaction.reply({ content: 'You cannot timeout a bot.', ephemeral: true });
        }
    
        await member.roles.add(timeoutRole.id);
    
        setTimeout(async () => {
            await member.roles.remove(timeoutRole.id);
        }, duration * 1000);
    
        const embed = new EmbedBuilder()
            .setTitle('Timeout Set')
            .setDescription(`User <@${member.id}> has been timed out for ${duration} seconds.`)
            .setColor(0x0099FF)
            .setTimestamp();
    
        await interaction.reply({ embeds: [embed], ephemeral: false });
    }
}

module.exports.details = {
    name: 'timeout',
    author: 'Vasilew__',
    icon: 'https://cdn.discordapp.com/avatars/365350852967399454/ce6e6e91fa887aa86e23ef356c9878fe',
    description: 'Set a timeout for a user.',
    usage: '/timeout <@user> <duration in seconds>'
}