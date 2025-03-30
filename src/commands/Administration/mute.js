const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
    .setName('mute')
    .setDescription('mute a user')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers, PermissionFlagsBits.ManageRoles)
    .addUserOption(option => option
        .setName('user')
        .setDescription('The user to mute')
        .setRequired(true)
    )
    .addStringOption(option => option
        .setName('reason')
        .setDescription('The reason for the mute')
        .setRequired(true)
    )
    .addIntegerOption(option => option
        .setName('duration')
        .setDescription('The duration of the mute in minutes')
        .setMinValue(0)
    ),
    async execute(interaction) {
        const user = interaction.options.getUser('user');
        const member = await interaction.guild.members.fetch(user.id)
        const reason = interaction.options.getString('reason');
        const duration = interaction.options.getInteger('duration');

        let mutedRole = interaction.guild.roles.cache.find(role => role.name === 'Muted');

        if (!mutedRole) {
            try {
                mutedRole = await interaction.guild.roles.create({
                    name: 'Muted',
                    permissions: []
                });
            } catch (error) {
                console.error(error);
                return interaction.reply({ content: 'An error occurred while creating the timeout role.', ephemeral: true });
            }
        }
    
            if (member.roles.cache.has(mutedRole)) {
                    return interaction.reply({ content: 'The user is already timed out.', ephemeral: false });
            }
            
                // Add the timeout role to the user
                member.roles.add(mutedRole);
                // Set the timeout role for the specified duration
                setMute(() => {
                    // Remove the timeout role from the user
                    member.roles.remove(mutedRole);
                }, duration * 1000);
                // Send a confirmation message
                const embed = new EmbedBuilder();
                embed.setTitle('Mute Set')
                .setDescription(`User with ID \`${member.id}\` has been set to Muted for ${duration} seconds. The reason for this is ${reason}`)
                .setColor(0x0099FF)
                .setTimestamp();
                await interaction.reply({ embeds: [embed], ephemeral: false });
            }
    }
module.exports.details = {
    name:'mute',
    author: 'Vasilew',
    icon: 'https://cdn.discordapp.com/avatars/365350852967399454/ce6e6e91fa887aa86e23ef356c9878fe',
    description: 'Mute a user',
    usage: '/mute @user <reason> <duration in minutes>'
}