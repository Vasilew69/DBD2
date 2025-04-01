const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../auth/auth');
const { client } = require('../bot');
const jsonfile = require('jsonfile');
const themes = "../src/configs/theme.json";
const { Player } = require('discord-player');
const { DefaultExtractors } = require('@discord-player/extractor');
const { YoutubeiExtractor } = require('discord-player-youtubei');

// Initialize the client.player
client.player = new Player(client, {
    ytdlOptions: {
        quality: 'highestaudio',
        highWaterMark: 1 << 25
    }
});
client.player.extractors.loadMulti(DefaultExtractors)
client.player.extractors.register(YoutubeiExtractor, {})
router.get('/player', ensureAuthenticated, async (req, res) => {
    const guildId = req.query.guildId; // Get guildId from query

    if (!guildId) {
        console.error("❌ Missing guildId parameter");
        return res.status(400).json({ error: 'Missing guildId parameter' });
    }

    console.log('✅ Guild ID:', guildId);
    console.log('✅ Client:', client);
    console.log('✅ Player:', client.player);

    if (!client.player) {
        console.error("❌ Player is not initialized");
        // Initialize the client.player here if it's not already initialized
        // For example, you can use the discord-player library to initialize the player
        // client.player = new Player(client);
        return res.status(500).json({ error: 'Player is not initialized' });
    }

    // Ensure the queue exists
    const queue = client.player.nodes.get(guildId);
    console.log('✅ Queue:', queue);

    if (!queue || !queue.currentTrack) {
        console.error("❌ No music playing");
        return res.status(500).json({ error: 'No music playing' });
    }

    console.log("✅ Current Track:", queue.currentTrack);

    try {
        const theme = jsonfile.readFileSync(themes);
        res.render('home/player', {
            profile: req.user,
            client: client,
            theme: theme,
            status: 'Playing',
            track: queue.currentTrack.title,
            artist: queue.currentTrack.author,
            thumbnail: queue.currentTrack.thumbnail,
            duration: queue.currentTrack.duration
        });
    } catch (error) {
        console.error("❌ Error reading theme file:", error);
        return res.status(500).json({ error: 'Failed to load theme file' });
    }
});

module.exports = router;
