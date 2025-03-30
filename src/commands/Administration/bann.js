const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Bans a user from the server')
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .addUserOption(option => option
            .setName('user')
            .setDescription('The user to ban')
            .setRequired(true)
        )
        .addStringOption(option => option
            .setName('reason')
            .setDescription('The reason for the ban')
        )
        .addIntegerOption(option => option
            .setName('duration')
            .setDescription('The duration of the ban in minutes')
            .setMinValue(0)
        ),
        async execute(interaction, client) {

            const user = interaction.options.getUser('user');
            const reason = interaction.options.getString('reason') || "No reason provided";
            const duration = interaction.options.getInteger('duration') * 60000 || 0;

            const member = await interaction.guild.members.fetch(user.id)
            const errEmbed = new EmbedBuilder()
               .setTitle("Error")
               .setDescription(`you can't ban this user (${user.username}) since they have a higher role`)
               .setColor(0x0099FF);

            if (member.roles.highest.position >= interaction.member.roles.highest.position) {
                return interaction.reply({ embeds: [errEmbed], ephemeral: false });
            }

            await member.ban({reason, duration})

            const embed = new EmbedBuilder()
               .setTitle("Ban")
               .setDescription(`Banned ${user.username} for ${duration === 0? "indefinitely" : `${duration / 60000} minutes`} with the reason: "${reason}" /n with userId: "${user.id}`)
               .setColor(0x0099FF);

            await interaction.reply({ embeds: [embed], ephemeral: false });
        }
    }
    module.exports.details = {
        name: 'Ban',
        author: 'Vasilew',
        icon: 'https://cdn.discordapp.com/avatars/365350852967399454/ce6e6e91fa887aa86e23ef356c9878fe',
        description: 'Bans a user from the server.',
        usage: `/ban {@user} {@reason} {@duration`
    };
