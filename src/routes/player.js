const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../auth/auth');
const { client } = require('../bot');
const jsonfile = require('jsonfile');
const themes = "../src/configs/theme.json";
const errth = "../src/configs/errth.json";
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
        const theme = jsonfile.readFileSync(themes);
        return res.status(500).render('home/playererror', {
            profile: req.user,
            client: client,
            theme: theme,
            errtheme: errth,
            error: 'Missing guildId'
        });
    }
    if (!client.player) {
        console.error("❌ Player is not initialized");
        const theme = jsonfile.readFileSync(themes);
        return res.status(500).render('home/playererror', {
            profile: req.user,
            client: client,
            theme: theme,
            errtheme: errth,
            error: 'Player is not initialized'
        });
    }

    // Ensure the queue exists
    const queue = client.player.nodes.get(guildId);


    if (!queue) {
        const theme = jsonfile.readFileSync(themes);
        console.error("❌ No music queue found");
        return res.status(500).render('home/playererror',{
            profile: req.user,
            client: client,
            theme: theme,
            errtheme: errth,
            error: 'No music queue found'
        });
    }

    // Check if there is a current track in the queue
    const currentTrack = queue.currentTrack;
    if (!currentTrack) {
        const theme = jsonfile.readFileSync(themes);
        console.error("❌ No music playing");
        return res.status(500).render('home/playererror',{
            profile: req.user,
            client: client,
            theme: theme,
            errtheme: errth,
            error: 'No music playing'
        });
    }

    try {
        const theme = jsonfile.readFileSync(themes);
        res.render('home/player', {
            profile: req.user,
            client: client,
            theme: theme,
            status: 'Playing',
            track: currentTrack.title,
            artist: currentTrack.author,
            thumbnail: currentTrack.thumbnail,
            duration: currentTrack.duration,
            guildId: guildId
        });
    } catch (error) {
        console.error("❌ Error reading theme file:", error);
        return res.status(500).json({ error: 'Failed to load theme file' });
    }
});



module.exports = router;
