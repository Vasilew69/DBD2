const { EmbedBuilder } = require("@discordjs/builders");
const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("kick")
        .setDescription("Kicks a user from the server")
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
        .addUserOption(option => option
            .setName("user")
            .setDescription("The user to kick")
            .setRequired(true)
        )
        .addStringOption(option => option
            .setName("reason")
            .setDescription("The reason for the kick")
        ),
    async execute(interaction) {
        const user = interaction.options.getUser("user");
        const member = await interaction.guild.members.fetch(user.id)
        const reason = interaction.options.getString("reason") || "No reason provided";
        
        if (!interaction.member.permissions.has("KICK_MEMBERS")) {
            const permEmbed = new EmbedBuilder()
               .setTitle("Permission Denied")
               .setDescription("You don't have permission to kick members.")
               .setColor(0x0099FF);
               return interaction.reply({ embeds: [permEmbed]});
        }

        await member.kick(reason);
        const embed = new EmbedBuilder()
           .setTitle("User Kicked")
           .setDescription(`User with ID \`${user.id}\` has been kicked from the server.`)
           .setColor(0x0099FF)
           .setTimestamp();
        
           await interaction.reply({ embeds: [embed]});
    }
}
module.exports.details = {
    name: 'Kick',
    author: 'Vasilew__',
    icon: 'https://cdn.discordapp.com/avatars/1161409662269272135/1ac51b5bbca693172e69336bb35d77b0',
    description: 'Kicks a user from the server.',
    usage: '/kick <@user> [reason]'
}