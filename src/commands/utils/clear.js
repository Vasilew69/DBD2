const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Clears messages')
        .addIntegerOption(option =>
            option.setName('amount')
                .setDescription('How many messages to remove (1-100)')
                .setMinValue(1)
                .setMaxValue(100)
                .setRequired(true)
        )
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Delete messages from a specific user')
        ),
    userPermissions: [PermissionFlagsBits.ManageMessages], // Fixed typo
    botPermissions: [PermissionFlagsBits.ManageMessages], // Fixed incorrect permission
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: false });

        const amount = interaction.options.getInteger('amount');
        const target = interaction.options.getUser('user');

        try {
            const channelMessages = await interaction.channel.messages.fetch({ limit: amount });

            if (channelMessages.size === 0) {
                const noEmbed = new EmbedBuilder()
                   .setTitle("No Messages Found")
                   .setDescription("No messages found in this channel.")
                   .setColor(0x0099FF);
                   return interaction.editReply({ embeds: [noEmbed], ephemeral: false });
            }

            let messagesToDelete = [];

            if (target) {
                // Filter messages by the target user
                messagesToDelete = channelMessages.filter(msg => msg.author.id === target.id).first(amount);
            } else {
                messagesToDelete = channelMessages.first(amount);
            }

            if (messagesToDelete.length === 0) {
                const noMUEmbed = new EmbedBuilder()
                   .setTitle("No Messages Found")
                   .setDescription("No messages found from this user.")
                   .setColor(0x0099FF);
                   return interaction.editReply({ embeds: [noMUEmbed], ephemeral: false });
            }

            await interaction.channel.bulkDelete(messagesToDelete, true);

            const successEmbed = new EmbedBuilder()
               .setTitle("Messages Cleared")
               .setDescription(`Cleared ${messagesToDelete.length} messages in this channel.`)
               .setColor(0x0099FF);
              await interaction.editReply({ embeds: [successEmbed], ephemeral: false });

        } catch (error) {
            console.error(error);
            const errEmbed = new EmbedBuilder()
               .setTitle("Error Clearing Messages")
               .setDescription(`An error occurred while clearing messages: ${error}.`)
               .setColor(0x0099FF);
               return interaction.editReply({ embeds: [errEmbed], ephemeral: false });
        }
    }
};
