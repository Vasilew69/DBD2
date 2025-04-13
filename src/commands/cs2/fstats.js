const { EmbedBuilder } = require("@discordjs/builders");
const { SlashCommandBuilder } = require("discord.js");
const axios = require('axios')
const dotenv = require('dotenv')
dotenv.config({ path: './configs/.env'})

module.exports = {
    data: new SlashCommandBuilder()
        .setName('fstats')
        .setDescription('Gives stas for a faceit player')
        .addStringOption(option => 
            option.setName('username')
            .setDescription('faceit username')
            .setRequired(true)
        )
        .addStringOption(option => 
            option.setName('game')
            .setDescription('game for the stas')
            .setRequired(false)
        ),
    async execute(interaction) {
        const nickname = interaction.options.getString('username');
        const apiKey = process.env.FKEY;

        if (!apiKey) {
            return interaction.reply({ content: '⚠️ Faceit API key is missing!'});
        }
        
        try {
            const player = await axios.get(`https://open.faceit.com/data/v4/players?nickname=${nickname}`, {
                headers: { Authorization: `Bearer ${apiKey}`}
            }) ;
            const playerData = player.data;
            const player_id = player.data.player_id;
            const statsResponse = await axios.get(`https://open.faceit.com/data/v4/players/${player_id}/stats/cs2`, {
                headers: { Authorization: `Bearer ${apiKey}`}
            })

            const playerStats = statsResponse.data;

            const playerName = player.data.nickname;
            const avatar = player.data.avatar;
            const stats = playerStats.lifetime;

            const embed = new EmbedBuilder()
                        .setColor(0x0099FF)
                        .setTitle(`Faceit Stats for ${playerName}`)
                        .setThumbnail(avatar)
                        .addFields(
                            { name: '🏅 Level', value: playerData.games.cs2.skill_level.toString(), inline: true },
                            { name: '📊 Elo', value: playerData.games.cs2.faceit_elo.toString(), inline: true },
                            { name: '🔥 Win Rate', value: `${stats['Win Rate %']}%`, inline: true },
                            { name: '🎯 K/D Ratio', value: `${stats['Average K/D Ratio']}%`, inline: true },
                            { name: '📈 Headshot %', value: `${stats['Average Headshots %']}%`, inline: true },
                            { name: '🎮 Matches Played', value: `${stats['Matches']}`, inline: true }
                        )
                        .setFooter({ text: `Player ID: ${player_id}` });
                    await interaction.reply({ embeds: [embed]});
        } catch(error) {
            console.log(error)
            const errEmbed = new EmbedBuilder()
               .setTitle('Error Fetching Faceit Stats')
               .setDescription(`An error occurred while fetching Faceit stats for \`${nickname}\`.`)
               .setColor(0x0099FF);
               await interaction.reply({ embeds: [errEmbed]});
        }
    }
}

module.exports.details = {
    name: 'faceit-stats',
    description: 'Displays Faceit stats for a given player.',
    usage: '/fstats @username [game]',
    author: 'Vasilew__',
}