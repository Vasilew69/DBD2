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
            return interaction.reply({ content: 'This command can only be used in a server.',});
        }
    
        const member = interaction.options.getMember('user');
        const duration = interaction.options.getInteger('duration');
    
        if (!member) {
            return interaction.reply({ content: 'User is not in the server.', });
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
                return interaction.reply({ content: 'An error occurred while creating the timeout role.',  });
            }
        }
    
        if (member.roles.cache.has(timeoutRole.id)) {
            return interaction.reply({ content: 'The user is already timed out.',});
        }
    
        if (interaction.guild.ownerId === member.id) {
            return interaction.reply({ content: 'You cannot timeout the server owner.',});
        }
    
        if (member.user.bot) {
            return interaction.reply({ content: 'You cannot timeout a bot.', });
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
    
        await interaction.reply({ embeds: [embed], });
    }
}

module.exports.details = {
    name: 'Timeout',
    author: 'Vasilew__',
    icon: 'https://cdn.discordapp.com/avatars/1161409662269272135/1ac51b5bbca693172e69336bb35d77b0',
    description: 'Set a timeout for a user.',
    usage: '/timeout <@user> <duration in seconds>'
}