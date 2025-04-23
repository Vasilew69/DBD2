const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const axios = require('axios');
const dotenv = require('dotenv')
dotenv.config({ path: './configs/.env'})

module.exports = {
    data: new SlashCommandBuilder()
            .setName('stats')
            .setDescription('CS2 Stats')
            .addStringOption(option =>
                option.setName('username')
                .setDescription('steam user')
                .setRequired(true)
            ),
    async execute(interaction) {
        const steamUsername = interaction.options.getString('username').trim();
        const SKEY = process.env.KEY;
        const steamId = `http://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=${SKEY}&vanityurl=${steamUsername}`;

        try { 
            
            const steamid = await axios.get(steamId)

            if (steamid.data.response.success !== 1) {
                return interaction.reply({ content: "Invalid Steam username."});
            }

            const Id = steamid.data.response.steamid;
            const steamGetName = await axios.get(`http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${SKEY}&steamids=${Id}`)
            const steamUserData = steamGetName.data.response.players;
            const steamName = steamUserData[0]?.personaname || 'Nothing';
            const steamAvatar = steamUserData[0]?.avatarfull;

            if (!Id) {
                const idEmbed = new EmbedBuilder()
                    .setColor(0x0099FF)
                    .setTitle("Error")
                    .setDescription("Could not retrieve player ID.");
                    interaction.reply({ embeds: [idEmbed]});
            }

            const cs2Response = await axios.get(`http://api.steampowered.com/ISteamUserStats/GetUserStatsForGame/v0002/?appid=730&key=${SKEY}&steamid=${Id}`,);

            const data = cs2Response.data;
            if(!data.playerstats) {
                const nfstatsEmbed = new EmbedBuilder()
                    .setColor(0x0099FF)
                    .setTitle("Error")
                    .setDescription("Could not find player stats.");
                    interaction.reply({ embeds: [nfstatsEmbed]});
            }
            console.log(steamName)

            const stats = data.playerstats.stats;

            const totalKills = stats.find(stat => stat.name === 'total_kills')?.value || 0;
            const totalDeaths = stats.find(stat => stat.name === 'total_deaths')?.value || 1;
            const kdRatio = (totalKills / totalDeaths).toFixed(2);
            const headshotPct = stats.find(stat => stat.name === 'total_kills_headshot')?.value || 0;
            const matchesPlayed = stats.find(stat => stat.name === 'total_matches_played')?.value || 0;

            const embed = new EmbedBuilder()
                        .setColor(0x0099FF)
                        .setTitle(`CS2 stats for ${steamName}`)
                        .setThumbnail(steamAvatar)
                        .addFields(
                            { name: 'Total Kills:', value: `${totalKills}`, inline: true},
                            { name: 'Total Deaths:', value: `${totalDeaths}`, inline: true},
                            { name: 'K/D Ration:', value: `${kdRatio}`, inline: true},
                            { name: 'Headshots:', value: `${headshotPct}`, inline: true},
                            { name: 'Matches Played', value: `${matchesPlayed}`, inline: true},
                        )
            return interaction.reply({embeds: [embed] });
        } catch (error) {
            console.error(error);
            const errEmbed = new EmbedBuilder()
               .setTitle('Error Fetching CS2 Stats')
               .setDescription(`An error occurred while fetching CS2 stats for user \`${steamUsername}\`.`)
               .setColor(0x0099FF);
               interaction.reply({ embeds: [errEmbed],});
        }
    }
}

module.exports.details = {
    name: "CS2 Stats",
    description: "Displays a player's CS2 stats from Steam.",
    icon: 'https://cdn.discordapp.com/avatars/1161409662269272135/1ac51b5bbca693172e69336bb35d77b0',
    author: "Vasilew",
    usage: "/stats <steam-username>"
}
