const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unban')
        .setDescription('Bans a user from the server')
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .addStringOption(option => option
            .setName('userid')
            .setDescription('The user to ban')
            .setRequired(false)
        ),
        async execute(interaction) {
            const userId = interaction.options.getString("userid");

            try {
                // Ban the user from the server
                await interaction.guild.members.unban(userId);

                const embed = new EmbedBuilder()
                   .setTitle('User Unbanned')
                   .setDescription(`User with ID \`${userId}\` has been unbanned from the server.`)
                   .setColor(0x0099FF)

                await interaction.reply({ embeds: [embed], ephermal: true });
            } catch(error) {
                console.error(error);
                
                const errEmbed = new EmbedBuilder()
                   .setTitle('Error Banning User')
                   .setDescription(`An error occurred while unbanning user with ID \`${userId}\`.`)
                   .setColor(0x0099FF);

                await interaction.reply({ embeds: [errEmbed], ephermal: true });
            }
        }
    }